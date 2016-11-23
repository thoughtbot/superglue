require 'time'
require 'rack/utils'
require 'blade'
require 'blade/assets'

module Sprockets
  module Server
    # `call` implements the Rack 1.x specification which accepts an
    # `env` Hash and returns a three item tuple with the status code,
    # headers, and body.
    #
    # Mapping your environment at a url prefix will serve all assets
    # in the path.
    #
    #     map "/assets" do
    #       run Sprockets::Environment.new
    #     end
    #
    # A request for `"/assets/foo/bar.js"` will search your
    # environment for `"foo/bar.js"`.
    def call(env)
      start_time = Time.now.to_f
      time_elapsed = lambda { ((Time.now.to_f - start_time) * 1000).to_i }

      if env['REQUEST_METHOD'] != 'GET'
        return method_not_allowed_response
      end

      msg = "Served asset #{env['PATH_INFO']} -"

      # Extract the path from everything after the leading slash
      path = Rack::Utils.unescape(env['PATH_INFO'].to_s.sub(/^\//, ''))

      # Strip fingerprint
      if fingerprint = path_fingerprint(path)
        path = path.sub("-#{fingerprint}", '')
      end

      # URLs containing a `".."` are rejected for security reasons.
      if forbidden_request?(path)
        return forbidden_response
      end

      # Look up the asset.
      options = {}
      options[:pipeline] = :self if body_only?(env)
      options[:accept] = env['HTTP_ACCEPT'] if env['HTTP_ACCEPT'] 
      asset = find_asset(path, options)

      # 2.x/3.x compatibility hack. Just ignore fingerprints on ?body=1 requests.
      # 3.x/4.x prefers strong validation of fingerprint to body contents, but
      # 2.x just ignored it.
      if asset && parse_asset_uri(asset.uri)[1][:pipeline] == "self"
        fingerprint = nil
      end

      if fingerprint
        if_match = fingerprint
      elsif env['HTTP_IF_MATCH']
        if_match = env['HTTP_IF_MATCH'][/^"(\w+)"$/, 1]
      end

      if env['HTTP_IF_NONE_MATCH']
        if_none_match = env['HTTP_IF_NONE_MATCH'][/^"(\w+)"$/, 1]
      end

      if asset.nil?
        status = :not_found
      elsif fingerprint && asset.etag != fingerprint
        status = :not_found
      elsif if_match && asset.etag != if_match
        status = :precondition_failed
      elsif if_none_match && asset.etag == if_none_match
        status = :not_modified
      else
        status = :ok
      end

      case status
      when :ok
        logger.info "#{msg} 200 OK (#{time_elapsed.call}ms)"
        ok_response(asset, env)
      when :not_modified
        logger.info "#{msg} 304 Not Modified (#{time_elapsed.call}ms)"
        not_modified_response(env, if_none_match)
      when :not_found
        logger.info "#{msg} 404 Not Found (#{time_elapsed.call}ms)"
        not_found_response
      when :precondition_failed
        logger.info "#{msg} 412 Precondition Failed (#{time_elapsed.call}ms)"
        precondition_failed_response
      end
    rescue Exception => e
      logger.error "Error compiling asset #{path}:"
      logger.error "#{e.class.name}: #{e.message}"

      case File.extname(path)
      when ".js"
        # Re-throw JavaScript asset exceptions to the browser
        logger.info "#{msg} 500 Internal Server Error\n\n"
        return javascript_exception_response(e)
      when ".css"
        # Display CSS asset exceptions in the browser
        logger.info "#{msg} 500 Internal Server Error\n\n"
        return css_exception_response(e)
      else
        raise
      end
    end
  end
end


class Response
  constructor: ({@url, @ignoreSamePathConstraint, @onRequestError, @onRequestEnd, @pushState})->

class Request
  constructor: ({@controller, @url,
    @header,
    @payload,
    @method,
    @onProgress,
    @onRequestError,
    @onRequestEnd,
    @pushState,
    @cacheRequest,
    @ignoreSamePathConstraint
  }) ->
      @response = new Response
        onRequestError: @onRequestError
        url: @url
        onRequestEnd: @onRequestEnd
        pushState: @pushState
        ignoreSamePathConstraint: @ignoreSamePathConstraint

  respond: ({status, header, body})->
    @response.url = @url
    @response.status = status
    @response.header = header
    @response.body = body
    @controller.onLoad(@response)

module.exports =
  response: Response
  request: Request

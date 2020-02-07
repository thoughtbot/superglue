require_relative '../../lib/props_template'
require_relative '../../lib/props_template/core_ext'

require 'json'

def eql_json(obj)
  eql(obj.to_json)
end

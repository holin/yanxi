require "yanxi"

module Yanxi
  class Request
    attr_accessor :path, :action, :sqls, :partials, :params, :complete

    def initialize
      @sqls = []
      @partials = []
      @params = ""
    end

    def uniq_key
      "#{action}"
    end

    def to_json
      {
        id: "#{(rand*100000).to_i}",
        path: path,
        action: action,
        sqls: sqls,
        partials: partials,
        params: params,
        complete: complete,
      }
    end

  end
end

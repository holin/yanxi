require "yanxi/version"
require "yanxi/request"
require "yanxi/exporter"

module Yanxi
  class Parser
    def parse(log_file)
      puts "parsing #{log_file}"
      log_file = File.open(log_file, "r")
      requests = []
      current_request = Request.new
      while line = log_file.gets
        next unless select?(line)
        line = clean(line)
        if new_request?(line)
          current_request = Request.new
          requests << current_request
        end

        if current_request != nil
          # fill request
          if line =~ /Started (:?GET|POST) "(.+?)" for/
            current_request.path = $2
          elsif line =~ /Processing by (.+?) as/
            current_request.action = $1
          elsif line =~ /Parameters: (\{.+\})/
            current_request.params = $1
          elsif line =~ /\(([\d|\.]+)ms\).+((:?SELECT|UPDATE|DELETE|INSERT).+)\n/
            arr = [$1, $2]
            current_request.sqls << arr
          elsif line =~ /Rendered (.+) \(([\d|\.]+)ms\)\n/
            arr = [$2, $1]
            current_request.partials << arr if available_partial(arr.last)
          elsif line =~ /(Completed 200 OK in ([\d|\.]+)ms \(Views: ([\d|\.]+)ms \| ActiveRecord: ([\d|\.]+)ms\))\n/
            arr = [$1, $2, $3, $4]
            current_request.complete = arr
            current_request = nil
          end
        end

      end
      log_file.close

      json_requests = {}

      requests.each do |r|
        request = json_requests[r.uniq_key] || r
        next if r.complete.nil?
        if r.complete[1] > request.complete[1]
          request = r
        end

        json_requests[request.uniq_key] = request
      end

      json_requests.keys.each do |key|
        json_requests[key] = json_requests[key].to_json
      end

      Exporter.new.export(json_requests)
    end

    private
      def select?(line)
        return false if line =~ /CACHE/
        true
      end

      def available_partial(partial_path)
        !partial_path.start_with?("/") and !partial_path.index("/_").nil?
      end

      def new_request?(line)
        line =~ /Started (GET|POST) /
      end

      def clean(line)
        line.gsub(/\e\[(?:[0-9];?)+m/, '')
      end
  end
end

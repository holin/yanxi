require "yanxi"
require "json"
require "yanxi/server"

module Yanxi
  class Exporter
    attr_accessor :requests

    def initialize
    end

    def export(json_requests)
      src_dir = File.join(File.dirname(__FILE__), "web")
      dest_dir = File.join(Dir.pwd, "tmp", "yanxi_export")
      data_file = File.join(dest_dir, "static", "data.json")
      FileUtils.cp_r(src_dir, dest_dir)
      json = {
        total: json_requests.size,
        per_page: json_requests.size,
        current_page: 1,
        last_page: 1,
        next_page_url: nil,
        prev_page_url: nil,
        from: 1,
        to: 1,
        data: json_requests.values
      }
      File.open(data_file, "w"){ |f| f.write(JSON.dump(json)) }
      puts "Please checkout export at #{dest_dir}"
      port = 3000 + (rand*10000).to_i
      url = "http://0.0.0.0:#{port}"
      puts "visit: #{url}"
      # run http server
      EmbedServer.new(dest_dir, port: port).run
    end

  end
end

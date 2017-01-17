require 'socket'
require 'uri'

module Yanxi

  # Usage:
  ## => EmbedServer.new(web_root).run
  class EmbedServer

    attr_accessor :web_root, :port

    def initialize(web_root, options = {})
      @web_root = web_root
      @port = options[:port] || 7000
    end

    def run
      server = TCPServer.new('0.0.0.0', port)
      loop do
        socket = server.accept
        request_line = socket.gets
        STDERR.puts request_line
        path = requested_file(request_line)
        path = File.join(path, 'index.html') if File.directory?(path)
        if File.exist?(path) && !File.directory?(path)
          File.open(path, 'rb') do |file|
            socket.print "HTTP/1.1 200 OK\r\n" \
                        "Content-Type: #{content_type(file)}\r\n" \
                        "Content-Length: #{file.size}\r\n" \
                        "Connection: close\r\n"
            socket.print "\r\n"
            IO.copy_stream(file, socket)
          end
        else
          message = "File not found\n"
          socket.print "HTTP/1.1 404 Not Found\r\n" \
                      "Content-Type: text/plain\r\n" \
                      "Content-Length: #{message.size}\r\n" \
                      "Connection: close\r\n"
          socket.print "\r\n"
          socket.print message
        end
        socket.close
      end

    end

    def content_type(path)
      content_type_mapping = {
        'html' => 'text/html',
        'txt' => 'text/plain',
        'json' => 'application/json', # add json support
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'gif' => 'image/gif'
      }

      default_content_type = 'application/octet-stream'
      ext = File.extname(path).split('.').last
      content_type_mapping.fetch(ext, default_content_type)
    end

    def requested_file(request_line)
      request_uri = request_line.split(' ')[1]
      path = URI.unescape(URI(request_uri).path)
      cleanurl = []
      parts = path.split('/')

      parts.each do |part|
        next if part.empty? || part == '.'
        part == '..' ? cleanurl.pop : cleanurl << part
      end
      File.join(web_root, *cleanurl)
    end


  end
end




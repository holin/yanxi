# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'yanxi/version'

Gem::Specification.new do |spec|
  spec.name          = "yanxi"
  spec.version       = Yanxi::VERSION
  spec.authors       = ["Holin"]
  spec.email         = ["holin.he@gmail.com"]

  spec.summary       = %q{Parse Rails development.log file, get response time, database query and partial rendered time. Run an HTTP server to checkout and filter these infomation}
  spec.description   = %q{Parse Rails development.log file, get response time, database query and partial rendered time. Run an HTTP server to checkout and filter these infomation}
  spec.homepage      = 'https://github.com/holin/yanxi'
  spec.license       = "MIT"

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the 'allowed_push_host'
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  if spec.respond_to?(:metadata)
    spec.metadata['allowed_push_host'] = 'https://rubygems.org'
  else
    raise "RubyGems 2.0 or newer is required to protect against " \
      "public gem pushes."
  end

  spec.files         = `git ls-files -z`.split("\x0").reject do |f|
    f.match(%r{^(test|spec|features|web)/})
  end
  spec.executables   = ["yanxi"]
  spec.require_paths = ["lib"]

  spec.add_development_dependency "bundler", "~> 1.13"
  spec.add_development_dependency "rake", "~> 10.0"
  spec.add_development_dependency "minitest", "~> 5.0"
end

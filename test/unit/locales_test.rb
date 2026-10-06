require File.expand_path('../test_helper', __dir__)

class LocalesTest < ActiveSupport::TestCase
  LOCALES = Dir[File.expand_path('../../config/locales/*.yml', __dir__)]

  def keys(hash, prefix = nil)
    hash.flat_map { |k, v| v.is_a?(Hash) ? keys(v, [prefix, k].compact.join('.')) : [[prefix, k].compact.join('.')] }
  end

  test 'every shipped locale has the keys of en' do
    reference = keys(YAML.load_file(LOCALES.find { |f| f.end_with?('/en.yml') }).values.first).sort
    LOCALES.each do |file|
      assert_equal reference, keys(YAML.load_file(file).values.first).sort, File.basename(file)
    end
  end
end

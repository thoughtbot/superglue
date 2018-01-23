babelrc = Rails.root.join(".babelrc")

if File.exist?(babelrc)
  react_babelrc = JSON.parse(File.read(babelrc))
  react_babelrc["presets"] ||= []
  react_babelrc["plugins"] ||= []

  if !react_babelrc["presets"].include?("react")
    react_babelrc["presets"].push("react")
    say "Copying react preset to your .babelrc file"

    File.open(babelrc, "w") do |f|
      f.puts JSON.pretty_generate(react_babelrc)
    end
  end

  if !react_babelrc["plugins"].any?{|plugin| Array(plugin).include?("module-resolver")}
    react_babelrc["plugins"].push(["module-resolver", {
      "root": ["./app"],
      "alias": {
        "views": "./app/views",
        "components": "./app/components",
        "javascripts": "./app/javascripts"
      }
    }])

    say "Copying module-resolver preset to your .babelrc file"

    File.open(babelrc, "w") do |f|
      f.puts JSON.pretty_generate(react_babelrc)
    end
  end

else
  say "Copying .babelrc to app root"
  copy_file "#{__dir__}/templates/mobile/babelrc", Rails.root.join(".babelrc")
end

say "Copying application.js file to app root"
copy_file "#{__dir__}/templates/mobile/app.js", Rails.root.join("App.js")

say "Copying rn-cli.config.js file to app root"
copy_file "#{__dir__}/templates/mobile/rn-cli.config.js", Rails.root.join("rn-cli.config.js")

say "Copying app.json expo file to app root"
copy_file "#{__dir__}/templates/mobile/app.json", Rails.root.join("app.json")

say "Copying package.json expo file to app root"
copy_file "#{__dir__}/templates/mobile/package.json", Rails.root.join("package.json")

say "Installing all breezy dependencies"
run "yarn"
run "yarn add react-native-elements --save"

say "Rails Breezy and ReactNative! 🎉", :green

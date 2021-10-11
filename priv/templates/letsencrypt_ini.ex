rsa-key-size = 4096
email = yithanglee@gmail.com
domains = <%= server.domain_name %>
text = True
authenticator = webroot
preferred-challenges = http-01
webroot-path = /<%=  project.alias_name %>/lib/<%= project.alias_name  %>-0.1.0/priv/static
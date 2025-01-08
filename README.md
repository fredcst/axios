<IfModule mod_headers.c>
    Header set X-XSS-Protection "1; mode=block"
    Header set Content-Security-Policy "default-src 'self';"
</IfModule>

<IfModule mod_rewrite.c>
RewriteEngine On

# Detectar cadenas sospechosas en cualquier parte de la URL o parámetros
RewriteCond %{REQUEST_URI} (\.\.|\/\.|\/\.\.|%2[Ee]) [NC,OR]
RewriteCond %{QUERY_STRING} (\?|%3[Ff]|&gt;|&lt;|%3[Cc]|%3[Ee]|<|>) [NC,OR]
RewriteCond %{THE_REQUEST} (\.\.|%2[Ee]|<|>|&lt;|&gt;) [NC]
RewriteRule ^.*$ /? [R=301,L]

</IfModule>
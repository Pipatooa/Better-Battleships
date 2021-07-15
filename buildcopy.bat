robocopy "./src/public" "./build/public" /S /XF "*.ts" "*.css.map" /XD "bootstrap"
robocopy "./src/public/bootstrap" "./build/public/bootstrap" "*.min.css" "*.min.js" /S
robocopy "./src/views" "./build/views" /S
echo 0

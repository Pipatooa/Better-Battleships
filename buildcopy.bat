robocopy "./src/public" "./build/public" /S /XF "*.ts" /XD "bootstrap"
robocopy "./src/public/bootstrap" "./build/public/bootstrap" "*.min.css" "*.min.css.map" "*.min.js" "*.min.js.map" /S
robocopy "./src/views" "./build/views" /S
exit /B 0

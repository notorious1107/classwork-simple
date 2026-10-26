@echo off
cd /d "%~dp0"
node preview-server.cjs
echo.
echo 班级网站已停止。按任意键关闭此窗口。
pause >nul

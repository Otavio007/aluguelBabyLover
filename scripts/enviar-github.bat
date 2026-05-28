@echo off
cd /d "%~dp0.."
echo === Enviando alteracoes para o GitHub ===
git status
echo.
git pull origin main --rebase
if errorlevel 1 (
  echo.
  echo ERRO no pull. Tente: git pull origin main
  pause
  exit /b 1
)
git push origin main
if errorlevel 1 (
  echo.
  echo ERRO no push. Verifique login no GitHub.
  pause
  exit /b 1
)
echo.
echo === Concluido! ===
pause

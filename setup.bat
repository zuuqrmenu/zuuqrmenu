@echo off
echo Setting up ZuuLab QR environment files...

REM Server .env
echo Creating server .env file...
cd server
if not exist .env (
    copy .env.example .env
    echo Server .env file created successfully.
) else (
    echo Server .env file already exists.
)

REM Client .env
echo Creating client .env file...
cd ..\client
if not exist .env (
    copy .env.example .env
    echo Client .env file created successfully.
) else (
    echo Client .env file already exists.
)

cd ..
echo.
echo Setup complete!
echo.
echo IMPORTANT: Edit the .env files with your actual configuration:
echo - server/.env (MongoDB URI, JWT secrets)
echo - client/.env (API URL)
echo.
echo Then run:
echo - Server: cd server && npm run dev
echo - Client: cd client && npm run dev
pause

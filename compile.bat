@echo off
cd /d "%~dp0TravelPlanner\backend"
call mvnw.cmd clean compile 2>&1

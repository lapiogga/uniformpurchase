@echo off
TITLE Uniform Purchase System - GCP Smart Deploy
SETLOCAL

:: ==========================================
:: 1. 프로젝트 설정 (사용자님이 이 부분을 수정해 주세요)
:: ==========================================
SET PROJECT_ID=uniformpurchase
SET DATABASE_URL=postgresql://admin:admin123@127.0.0.1:5432/uniform_db

echo.
echo ========================================================
echo   피복구매시스템 GCP 스마트 배포를 시작합니다.
echo ========================================================
echo.

:: 프로젝트 설정 확인
if "%PROJECT_ID%"=="YOUR_PROJECT_ID_HERE" (
    echo [오류] PROJECT_ID가 설정되지 않았습니다. 
    echo 파일을 우클릭-편집하여 PROJECT_ID를 실제 값으로 수정해 주세요.
    pause
    exit
)

echo [1/4] GCP 프로젝트를 %PROJECT_ID%로 설정합니다...
call gcloud config set project %PROJECT_ID%
if %ERRORLEVEL% NEQ 0 (
    echo [오류] gcloud 설정을 확인해 주세요.
    pause
    exit
)

echo.
echo [2/4] 필요한 API를 활성화합니다...
call gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com sqladmin.googleapis.com

echo.
echo [3/4] Artifact Registry 저장소를 확인/생성합니다...
:: 저장소가 이미 있는지 확인하고 없으면 생성 (asia-northeast3)
call gcloud artifacts repositories describe uniform-purchase --location=asia-northeast3 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [정보] 저장소가 없어 새로 생성합니다...
    call gcloud artifacts repositories create uniform-purchase --repository-format=docker --location=asia-northeast3 --description="Uniform Purchase System App"
) else (
    echo [정보] 기존 저장소를 사용합니다.
)

echo.
echo [4/4] 클라우드 빌드 및 배포를 시작합니다...
echo (이 과정은 몇 분 정도 소요됩니다. SUCCESS 메시지가 뜰 때까지 기다려 주세요.)
call gcloud builds submit --config cloudbuild.yaml --substitutions=_DATABASE_URL="%DATABASE_URL%" .

echo.
echo ========================================================
echo   배포 프로세스가 완료되었습니다!
echo   위에 표시된 URL 주소(https://...)를 확인하세요.
echo ========================================================
echo.
pause

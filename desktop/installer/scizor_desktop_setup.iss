[Setup]
; Basic Information
AppId={{F2E5A8B4-3D1C-4F6E-9A7B-1E2C3D4F5A6B}
AppName=Scizor Desktop
AppVersion=1.0.0
AppPublisher=Scizor
AppPublisherURL=https://scizor.com
AppSupportURL=https://scizor.com/support
AppUpdatesURL=https://scizor.com/updates
DefaultDirName={autopf}\Scizor Desktop
DefaultGroupName=Scizor Desktop
AllowNoIcons=yes
LicenseFile=LICENSE.txt
InfoBeforeFile=INFO_BEFORE.txt
InfoAfterFile=INFO_AFTER.txt
OutputDir=output
OutputBaseFilename=ScizorDesktopSetup
SetupIconFile=..\src\resources\icons\scizor_icon.ico
Compression=lzma
SolidCompression=yes
WizardStyle=modern
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64

; Visual Customization (optional)
; WizardImageFile=installer_banner.bmp
; WizardSmallImageFile=installer_small.bmp

; Privileges
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=commandline

; System Requirements
MinVersion=6.1sp1

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 6.1
Name: "startup"; Description: "Start Scizor Desktop with Windows"; GroupDescription: "Startup Options"; Flags: unchecked

[Files]
; Main executable
Source: "..\dist\ScizorDesktop.exe"; DestDir: "{app}"; Flags: ignoreversion

; Resources and data files
Source: "..\src\resources\*"; DestDir: "{app}\resources"; Flags: ignoreversion recursesubdirs createallsubdirs

; Documentation
Source: "README.txt"; DestDir: "{app}"; Flags: ignoreversion
Source: "LICENSE.txt"; DestDir: "{app}"; Flags: ignoreversion

; Visual C++ Redistributable (if needed)
; Source: "vcredist_x64.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall

[Icons]
Name: "{group}\Scizor Desktop"; Filename: "{app}\ScizorDesktop.exe"
Name: "{group}\{cm:UninstallProgram,Scizor Desktop}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\Scizor Desktop"; Filename: "{app}\ScizorDesktop.exe"; Tasks: desktopicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\Scizor Desktop"; Filename: "{app}\ScizorDesktop.exe"; Tasks: quicklaunchicon

[Registry]
; Auto-start with Windows (optional)
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "ScizorDesktop"; ValueData: "{app}\ScizorDesktop.exe"; Flags: uninsdeletevalue; Tasks: startup

; File associations (optional - only if we have permissions)
; Note: These registry entries are commented out to avoid permission issues
; Users can manually associate files if needed
; Root: HKCR; Subkey: ".scizor"; ValueType: string; ValueName: ""; ValueData: "ScizorFile"; Flags: uninsdeletevalue
; Root: HKCR; Subkey: "ScizorFile"; ValueType: string; ValueName: ""; ValueData: "Scizor File"; Flags: uninsdeletevalue
; Root: HKCR; Subkey: "ScizorFile\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\ScizorDesktop.exe,0"; Flags: uninsdeletevalue
; Root: HKCR; Subkey: "ScizorFile\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\ScizorDesktop.exe"" ""%1"""; Flags: uninsdeletevalue

[Run]
; Launch application after installation
Filename: "{app}\ScizorDesktop.exe"; Description: "{cm:LaunchProgram,Scizor Desktop}"; Flags: nowait postinstall skipifsilent

; Install Visual C++ Redistributable if needed
; Filename: "{tmp}\vcredist_x64.exe"; Parameters: "/quiet"; StatusMsg: "Installing Visual C++ Redistributable..."; Flags: waituntilterminated

[UninstallDelete]
Type: filesandordirs; Name: "{app}"

[Code]
function GetUninstallString(): String;
var
  sUnInstPath: String;
  sUnInstallString: String;
begin
  sUnInstPath := ExpandConstant('Software\Microsoft\Windows\CurrentVersion\Uninstall\{#SetupSetting("AppId")}_is1');
  sUnInstallString := '';
  if not RegQueryStringValue(HKLM, sUnInstPath, 'UninstallString', sUnInstallString) then
    RegQueryStringValue(HKCU, sUnInstPath, 'UninstallString', sUnInstallString);
  Result := sUnInstallString;
end;

function IsUpgrade(): Boolean;
begin
  Result := (GetUninstallString() <> '');
end;

function UnInstallOldVersion(): Integer;
var
  sUnInstallString: String;
  iResultCode: Integer;
begin
  Result := 0;
  sUnInstallString := GetUninstallString();
  if sUnInstallString <> '' then begin
    sUnInstallString := RemoveQuotes(sUnInstallString);
    if Exec(sUnInstallString, '/SILENT /NORESTART /SUPPRESSMSGBOXES','', SW_HIDE, ewWaitUntilTerminated, iResultCode) then
      Result := 3
    else
      Result := 2;
  end else
    Result := 1;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if (CurStep=ssInstall) then
  begin
    if (IsUpgrade()) then
    begin
      UnInstallOldVersion();
    end;
  end;
end;

function InitializeSetup(): Boolean;
begin
  Result := True;
  
  // Check if application is running
  if CheckForMutexes('ScizorDesktopMutex') then
  begin
    if MsgBox('Scizor Desktop is currently running. Please close it and try again.', mbError, MB_OK) = IDOK then
    begin
      Result := False;
    end;
  end;
end;

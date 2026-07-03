# Sobe o dev server do Next com Node 24.
# Motivo: o Node padrão desta máquina é o v14 (incompatível com Next 16, que exige >=20).
# Rodar o binário do Next direto com o Node 24 também evita o ERR_INVALID_AUTH do npm.
# Uso:  .\dev.ps1        (na pasta web/)
$node24 = Join-Path $env:LOCALAPPDATA 'nvm\v24.15.0\node.exe'
if (-not (Test-Path $node24)) {
  Write-Error "Node 24 nao encontrado em $node24. Rode: nvm install 24.15.0"
  exit 1
}
& $node24 "node_modules\next\dist\bin\next" dev

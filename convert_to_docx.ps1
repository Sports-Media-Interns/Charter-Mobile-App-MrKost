$word = New-Object -ComObject Word.Application
$word.Visible = $false

$docsPath = "E:\Documents1\_1 A DAKDAN\_AI Scripts-Recordings\2024 Projects\GitHub Repos\charterjetapp\Docs"
$outputPath = "E:\Documents1\_1 A DAKDAN\_AI Scripts-Recordings\2024 Projects\GitHub Repos\charterjetapp\WordDocs"

if (-not (Test-Path $outputPath)) {
    New-Item -ItemType Directory -Path $outputPath | Out-Null
}

$files = Get-ChildItem -Path $docsPath -Filter "*FINAL*.md"

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $docName = $file.BaseName -replace "_FINAL", ""
    $outputFile = Join-Path $outputPath "$docName.docx"

    $doc = $word.Documents.Add()
    $selection = $word.Selection
    $selection.TypeText($content)

    $doc.SaveAs($outputFile)
    $doc.Close()

    Write-Output "Created: $docName.docx"
}

$word.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
Write-Output "All documents converted!"

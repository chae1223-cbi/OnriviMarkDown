Add-Type -AssemblyName System.Drawing
$base = 'C:\Users\chae1\Downloads\Mobile Devices'
$out = 'D:\Developer\OnriviMarkDown\OnriviMarkDown'
$items = @(
  @('Screenshot_20261030_205605_Toss.jpg','tajasong-screen-1-636x1048.png'),
  @('Screenshot_20261030_212026_Toss.jpg','tajasong-screen-2-636x1048.png'),
  @('Screenshot_20261030_212042_Toss.jpg','tajasong-screen-3-636x1048.png')
)
$sources = @()
foreach ($item in $items) {
  $img = [System.Drawing.Image]::FromFile((Join-Path $base $item[0]))
  $sources += $img
  $bmp = New-Object System.Drawing.Bitmap 636,1048
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($img, [System.Drawing.Rectangle]::new(0,0,636,1048), [System.Drawing.Rectangle]::new(0,0,$img.Width,[int]($img.Width*1048/636)), [System.Drawing.GraphicsUnit]::Pixel)
  $bmp.Save((Join-Path $out $item[1]),[System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}
$wide = New-Object System.Drawing.Bitmap 1504,741
$wg = [System.Drawing.Graphics]::FromImage($wide)
$wg.Clear([System.Drawing.Color]::FromArgb(242,245,250))
$wg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
for ($i=0; $i -lt 3; $i++) {
  $x = 43 + $i*488
  $img = $sources[$i]
  $wg.DrawImage($img,[System.Drawing.Rectangle]::new($x,27,442,687),[System.Drawing.Rectangle]::new(0,0,$img.Width,[int]($img.Width*687/442)),[System.Drawing.GraphicsUnit]::Pixel)
}
$wide.Save((Join-Path $out 'tajasong-screen-wide-1504x741.png'),[System.Drawing.Imaging.ImageFormat]::Png)
$wg.Dispose(); $wide.Dispose()
foreach ($img in $sources) { $img.Dispose() }

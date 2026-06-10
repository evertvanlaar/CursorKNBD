"""Regenerate QR PNGs — sharp modules, no blurry resize."""
import qrcode
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PIX = ROOT / 'pix'


def save_sharp(url: str, path: Path, box_size: int = 12) -> None:
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=box_size,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color='black', back_color='white')
    img.save(path)
    print(f'wrote {path.name} ({img.size[0]}x{img.size[1]})')


def main() -> None:
    play = 'https://play.google.com/store/apps/details?id=com.kalanera.app'
    save_sharp(play, PIX / 'play-store-qr-en.png')
    save_sharp(play, PIX / 'play-store-qr-el.png')
    save_sharp('https://www.kalanera.gr/install.html', PIX / 'install-qr-en.png')
    save_sharp('https://www.kalanera.gr/install-el.html', PIX / 'install-qr-el.png')


if __name__ == '__main__':
    main()

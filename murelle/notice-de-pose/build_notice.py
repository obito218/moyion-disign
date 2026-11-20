import re, sys

SRC, OUT = sys.argv[1], sys.argv[2]
src = open(SRC, encoding='utf-8').read()
svgs = re.findall(r'<svg.*?</svg>', src, re.S)

# --- palette MURELLE (DESIGN.md du thème) ---------------------------------
FOREST = '#343C32'; CREAM = '#F4EFE5'; SURFACE = '#FAF7F1'; SAND = '#DCCFBA'
SAGE = '#A0B292'; SAGE_L = '#C9D5BC'; TAN = '#E9DFCB'; FILET = '#E2D9C8'; MUTED = '#545C51'
FONT_UI = "'Work Sans', system-ui, sans-serif"
FONT_H = "Newsreader, Georgia, serif"
FONT_M = "'IBM Plex Mono', ui-monospace, monospace"

def recolor(s):
    for a, b in [('#2F4A3C', FOREST), ('#23302A', FOREST), ('#9DB08C', SAGE), ('#F6F1E6', CREAM),
                 ('#FBF8F0', SURFACE), ('#CFC1A4', SAND), ('Jost, Inter, system-ui, sans-serif', "Work Sans, system-ui, sans-serif")]:
        s = s.replace(a, b)
    return s

def fig(cx, larm, rarm):
    """Le petit personnage MURELLE : mêmes proportions que dans toutes les étapes."""
    return (f'<g><circle cx="{cx}" cy="97" r="9.5" fill="{FOREST}"></circle>'
            f'<rect x="{cx-13}" y="110" width="26" height="54" rx="11" fill="{FOREST}"></rect>'
            f'<g stroke="{FOREST}" stroke-width="10" stroke-linecap="round" fill="none">'
            f'<line x1="{cx-6}" y1="161" x2="{cx-7}" y2="227"></line><line x1="{cx+6}" y1="161" x2="{cx+7}" y2="227"></line></g>'
            f'<g stroke="{FOREST}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none">'
            f'<polyline points="{larm}"></polyline><polyline points="{rarm}"></polyline></g></g>')

LEAF = ('<g transform="{t}"><path d="M0 0 C 18 -28 52 -40 86 -34 C 70 -8 34 10 0 0 Z" fill="{f}"></path>'
        '<path d="M4 -2 C 30 -16 56 -26 82 -33" fill="none" stroke="' + SURFACE + '" stroke-width="1.2"></path></g>')

# --- Schéma d'ouverture : 7 lés de 50 cm, sens de pose -----------------------
def hero_svg():
    sx = 1.1                       # px par cm
    lw = 50 * sx                   # largeur d'un lé
    n = 7
    x0, y0 = 196, 64
    W, H = n * lw, 250 * sx
    x1, y1 = x0 + W, y0 + H
    p = [f'<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Schéma : un mur de 340 cm de large et 250 cm de haut reçoit 7 lés de 50 cm, numérotés de 1 à 7 de gauche à droite. Le lé numéro 1 se pose en premier, à gauche. Un personnage de 1,75 m donne l\'échelle." viewBox="0 0 780 486" style="width:100%;height:auto;display:block">',
         f'<rect width="780" height="486" fill="{TAN}"></rect>',
         f'<rect x="{x0}" y="{y0}" width="{W:.1f}" height="{H:.1f}" fill="{SURFACE}"></rect>',
         f'<clipPath id="clhero"><rect x="{x0}" y="{y0}" width="{W:.1f}" height="{H:.1f}"></rect></clipPath><g clip-path="url(#clhero)">']
    for (tx, ty, r, s, f) in [(204, 300, -42, 2.3, SAGE), (300, 222, -16, 2.5, SAGE), (372, 330, -84, 2.2, SAGE_L),
                              (464, 268, -30, 2.3, SAGE), (506, 150, -55, 1.9, SAGE_L), (250, 150, -70, 1.6, SAGE_L)]:
        p.append(LEAF.format(t=f'translate({tx} {ty}) rotate({r}) scale({s})', f=f))
    p.append('</g>')
    # lé n°1 mis en évidence
    p.append(f'<rect x="{x0}" y="{y0}" width="{lw:.1f}" height="{H:.1f}" fill="{SAGE}" fill-opacity="0.28"></rect>')
    for i in range(1, n):
        x = x0 + i * lw
        p.append(f'<line x1="{x:.1f}" y1="{y0}" x2="{x:.1f}" y2="{y1:.1f}" stroke="{FOREST}" stroke-width="1.2"></line>')
    p.append(f'<rect x="{x0}" y="{y0}" width="{W:.1f}" height="{H:.1f}" fill="none" stroke="{FOREST}" stroke-width="2"></rect>')
    p.append(f'<rect x="{x0}" y="{y1-13:.1f}" width="{W:.1f}" height="13" fill="{SAND}" stroke="{FOREST}" stroke-width="1.4"></rect>')
    for i in range(n):
        cx = x0 + i * lw + lw / 2
        p.append(f'<circle cx="{cx:.1f}" cy="{y0+30}" r="18" fill="{FOREST}"></circle>'
                 f'<text x="{cx:.1f}" y="{y0+37}" text-anchor="middle" font-family="Work Sans, system-ui, sans-serif" font-size="20" font-weight="600" fill="{CREAM}">{i+1}</text>')
    # repère « commencez ici »
    c1 = x0 + lw / 2
    p.append(f'<text x="{x0}" y="30" font-family="Work Sans, system-ui, sans-serif" font-size="17" font-weight="600" fill="{FOREST}">Lé n°1 : commencez ici</text>'
             f'<line x1="{c1:.1f}" y1="38" x2="{c1:.1f}" y2="{y0+8}" stroke="{FOREST}" stroke-width="2"></line>'
             f'<polygon points="{c1-5:.1f},{y0+4} {c1+5:.1f},{y0+4} {c1:.1f},{y0+11}" fill="{FOREST}"></polygon>')
    # cote : 50 cm par lé (sur le lé 4)
    a, b = x0 + 5 * lw, x0 + 6 * lw
    p.append(f'<g stroke="{FOREST}" stroke-width="1.6"><line x1="{a:.1f}" y1="{y0-14}" x2="{b:.1f}" y2="{y0-14}"></line><line x1="{a:.1f}" y1="{y0-20}" x2="{a:.1f}" y2="{y0-8}"></line><line x1="{b:.1f}" y1="{y0-20}" x2="{b:.1f}" y2="{y0-8}"></line></g>'
             f'<text x="{(a+b)/2:.1f}" y="{y0-24}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="15" fill="{FOREST}">50 cm</text>')
    # cote largeur
    yd = y1 + 26
    p.append(f'<g stroke="{FOREST}" stroke-width="1.4"><line x1="{x0}" y1="{yd:.1f}" x2="{x1:.1f}" y2="{yd:.1f}"></line><line x1="{x0}" y1="{yd-7:.1f}" x2="{x0}" y2="{yd+7:.1f}"></line><line x1="{x1:.1f}" y1="{yd-7:.1f}" x2="{x1:.1f}" y2="{yd+7:.1f}"></line></g>'
             f'<text x="{(x0+x1)/2:.1f}" y="{yd+24:.1f}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="15" fill="{FOREST}">7 lés × 50 cm</text>')
    # flèche sens de pose
    ya = yd + 72
    p.append(f'<line x1="{x0}" y1="{ya:.1f}" x2="{x1-14:.1f}" y2="{ya:.1f}" stroke="{FOREST}" stroke-width="2.4" stroke-linecap="round"></line>'
             f'<polygon points="{x1:.1f},{ya:.1f} {x1-16:.1f},{ya-8:.1f} {x1-16:.1f},{ya+8:.1f}" fill="{FOREST}"></polygon>'
             f'<text x="{(x0+x1)/2:.1f}" y="{ya-10:.1f}" text-anchor="middle" font-family="Work Sans, system-ui, sans-serif" font-size="16" font-weight="500" fill="{FOREST}">sens de pose : 1, 2, 3… jusqu\'au dernier lé</text>')
    # cote hauteur
    xh = x1 + 26
    p.append(f'<g stroke="{FOREST}" stroke-width="1.4"><line x1="{xh:.1f}" y1="{y0}" x2="{xh:.1f}" y2="{y1:.1f}"></line><line x1="{xh-7:.1f}" y1="{y0}" x2="{xh+7:.1f}" y2="{y0}"></line><line x1="{xh-7:.1f}" y1="{y1:.1f}" x2="{xh+7:.1f}" y2="{y1:.1f}"></line></g>'
             f'<text x="0" y="0" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="15" fill="{FOREST}" transform="translate({xh+22:.1f} {(y0+y1)/2:.1f}) rotate(-90)">hauteur 250 cm</text>')
    # personnage à l'échelle (1,75 m)
    s = 175 * sx / 145
    p.append(f'<g transform="translate(108 {y1:.1f}) scale({s:.3f}) translate(0 -135)">{fig(0, "-13,24 -15,32", "13,24 15,32")}</g>'.replace('cy="97"', 'cy="0"').replace('y="110"', 'y="13"')
             .replace('y1="161"', 'y1="64"').replace('y2="227"', 'y2="130"').replace('-13,24 -15,32', '-13,24 -15,32'))
    p.append(f'<text x="108" y="{y1+24:.1f}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="14" fill="{FOREST}">1,75 m</text>')
    p.append(f'<line x1="40" y1="{y1:.1f}" x2="{x1+60:.1f}" y2="{y1:.1f}" stroke="{FOREST}" stroke-width="1.6"></line>')
    p.append('</svg>')
    return ''.join(p)

# --- Étape 2 : lés étalés au sol, contrôle à la loupe -----------------------
def step2_svg():
    p = [f'<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Le colis est ouvert, les sept lés sont étalés au sol dans l\'ordre de 1 à 7 ; un petit personnage contrôle le raccord du motif avec une loupe." viewBox="0 0 360 260" style="width:100%;height:auto;display:block">',
         f'<rect width="360" height="260" rx="16" fill="{TAN}"></rect>',
         f'<rect x="24" y="24" width="312" height="146" fill="{SURFACE}" stroke="{FOREST}" stroke-width="1.5"></rect>',
         f'<polygon points="24,170 336,170 352,244 8,244" fill="#EFE7D8"></polygon>',
         f'<line x1="8" y1="170" x2="352" y2="170" stroke="{FOREST}" stroke-width="1.5"></line>',
         # colis ouvert
         f'<rect x="34" y="126" width="58" height="44" fill="{SAND}" stroke="{FOREST}" stroke-width="1.5"></rect>',
         f'<polyline points="34,126 24,108" fill="none" stroke="{FOREST}" stroke-width="1.5" stroke-linecap="round"></polyline>',
         f'<polyline points="92,126 104,110" fill="none" stroke="{FOREST}" stroke-width="1.5" stroke-linecap="round"></polyline>',
         f'<line x1="34" y1="138" x2="92" y2="138" stroke="{FOREST}" stroke-width="1"></line>']
    n, ty, by = 7, 182, 238
    tl, tr, bl, br = 74, 242, 44, 276
    tw, bw = (tr - tl) / n, (br - bl) / n
    clip = f'{tl},{ty} {tr},{ty} {br},{by} {bl},{by}'
    p.append(f'<clipPath id="clfloor"><polygon points="{clip}"></polygon></clipPath>')
    p.append(f'<polygon points="{clip}" fill="{SURFACE}"></polygon>')
    p.append(f'<g clip-path="url(#clfloor)"><path d="M40 230 C 90 200, 130 236, 170 210 S 240 196, 282 222" fill="none" stroke="{SAGE}" stroke-width="7" stroke-linecap="round"></path>'
             f'<path d="M60 196 C 110 186, 160 206, 250 190" fill="none" stroke="{SAGE_L}" stroke-width="6" stroke-linecap="round"></path></g>')
    for i in range(n + 1):
        xt, xb = tl + i * tw, bl + i * bw
        p.append(f'<line x1="{xt:.1f}" y1="{ty}" x2="{xb:.1f}" y2="{by}" stroke="{FOREST}" stroke-width="1.1"></line>')
    p.append(f'<polygon points="{clip}" fill="none" stroke="{FOREST}" stroke-width="1.4"></polygon>')
    yc = 196
    t = (yc - ty) / (by - ty)
    for i in range(n):
        cx = (tl + (i + .5) * tw) * (1 - t) + (bl + (i + .5) * bw) * t
        p.append(f'<circle cx="{cx:.1f}" cy="{yc}" r="8" fill="{FOREST}"></circle><text x="{cx:.1f}" y="{yc+4}" text-anchor="middle" font-family="Work Sans, system-ui, sans-serif" font-size="10.5" font-weight="600" fill="{CREAM}">{i+1}</text>')
    # loupe sur le raccord, entre les lés 6 et 7
    p.append(f'<circle cx="236" cy="216" r="15" fill="{SURFACE}" fill-opacity="0.45" stroke="{FOREST}" stroke-width="2.6"></circle>'
             f'<line x1="247" y1="205" x2="264" y2="182" stroke="{FOREST}" stroke-width="4.5" stroke-linecap="round"></line>')
    p.append(fig(302, "289,121 276,146 266,178", "315,121 317,126 319,150"))
    p.append('</svg>')
    return ''.join(p)

# --- Pictogrammes -------------------------------------------------------------
def pic(body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 64 64" width="52" height="52" fill="none" stroke="{FOREST}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">{body}</svg>')

PICTOS = {
 'count': pic(f'<rect x="8" y="10" width="11" height="40" rx="5" fill="{SAGE_L}"></rect><rect x="22" y="10" width="11" height="40" rx="5"></rect><rect x="36" y="10" width="11" height="40" rx="5" fill="{SAGE_L}"></rect><circle cx="49" cy="48" r="10" fill="{CREAM}"></circle><path d="M44 48 L48 52 L55 43"></path>'),
 'order': pic(f'<rect x="8" y="8" width="20" height="48" fill="{SURFACE}"></rect><rect x="34" y="8" width="20" height="48" fill="{SURFACE}"></rect><circle cx="18" cy="20" r="7" fill="{FOREST}"></circle><circle cx="44" cy="20" r="7" fill="{FOREST}"></circle><path d="M16.5 17.5 L18.5 16 V24" stroke="{CREAM}" stroke-width="1.8"></path><path d="M41.5 17.5 C42 15.5 46.5 15.5 46.5 18 C46.5 20 41.5 22 41.5 24 H46.5" stroke="{CREAM}" stroke-width="1.8"></path><path d="M14 40 C20 34 28 44 36 38 C42 34 48 38 50 40" stroke="{SAGE}" stroke-width="3"></path>'),
 'motif': pic(f'<rect x="6" y="8" width="30" height="44" fill="{SURFACE}"></rect><path d="M12 42 C16 28 26 22 32 22 C30 32 22 40 12 42 Z" fill="{SAGE}"></path><rect x="34" y="24" width="24" height="32" fill="{CREAM}"></rect><path d="M39 32 H53 M39 38 H53 M39 44 H47"></path><path d="M44 50 L47 53 L53 46" stroke="{FOREST}" stroke-width="2.4"></path>'),
 'space': pic(f'<path d="M4 56 H60"></path><path d="M10 56 L14 50 H50 L54 56" fill="{SAGE_L}"></path><path d="M16 28 H36 L33 50 H19 Z" fill="{SURFACE}"></path><path d="M19 28 C19 18 33 18 33 28"></path><rect x="44" y="10" width="8" height="18" rx="3"></rect><rect x="42" y="28" width="12" height="14" rx="2" fill="{SAGE_L}"></rect>'),
 'clean': pic(f'<path d="M10 24 C18 18 26 30 34 24 C42 18 50 30 56 24 V44 C50 50 42 38 34 44 C26 50 18 38 10 44 Z" fill="{SAGE_L}"></path><path d="M24 10 C22 14 22 16 24 18 C26 16 26 14 24 10 Z" fill="{SAGE}"></path><path d="M40 6 C38 10 38 12 40 14 C42 12 42 10 40 6 Z" fill="{SAGE}"></path>'),
 'humid': pic(f'<path d="M32 8 C24 20 16 30 16 40 A16 16 0 0 0 48 40 C48 30 40 20 32 8 Z" fill="{SAGE_L}"></path><path d="M10 54 L54 10"></path>'),
 'help': pic(f'<path d="M8 14 H56 V42 H28 L16 54 V42 H8 Z" fill="{SURFACE}"></path><circle cx="22" cy="28" r="2.6" fill="{FOREST}"></circle><circle cx="32" cy="28" r="2.6" fill="{FOREST}"></circle><circle cx="42" cy="28" r="2.6" fill="{FOREST}"></circle>'),
}

# --- Étapes (texte inchangé ; seule la présentation évolue) -------------------
def steps_from_source():
    sec = re.findall(r'Étape (\d\d) sur 08</div>.*?<h2[^>]*>(.*?)</h2></div>\s*<p[^>]*>(.*?)</p>\s*<ul[^>]*>(.*?)</ul>', src, re.S)
    out = []
    for num, title, lead, ul in sec:
        items = re.findall(r'<span style="font-size:17px;line-height:1.55">(.*?)</span>', ul)
        out.append((num, title, lead, items))
    return out

steps = steps_from_source()
assert len(steps) == 8, len(steps)
step_svgs = [recolor(s) for s in svgs[11:19]]
step_svgs[1] = step2_svg()
# étape 4 : l'étiquette du sac ne présume plus du type de colle (à confirmer par gamme)
step_svgs[3] = step_svgs[3].replace('>colle</text>', '>colle</text>', 1)
step_svgs[3] = re.sub(r'<text x="67" y="214"[^>]*>intissé</text>', '', step_svgs[3])
step_svgs[3] = step_svgs[3].replace('<text x="67" y="200"', '<text x="67" y="206"').replace("à côté d'un sac de colle pour intissé", "à côté d'un sac de colle")
mat_icons = [recolor(s).replace('width="56" height="56"', 'width="52" height="52"') for s in svgs[1:11]]
mat_labels = re.findall(r'<div style="font-size:15px;line-height:1.35;color:#23302A">(.*?)</div>', src)
assert len(mat_labels) == 10, mat_labels

LABEL = f"font-family:{FONT_M};font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:{MUTED}"
H2 = f"margin:0;font-family:{FONT_H};font-weight:400;font-size:clamp(32px,4vw,46px);line-height:1.08;letter-spacing:-.02em;color:{FOREST}"
WRAP = "max-width:1120px;margin:0 auto;padding-inline:clamp(20px,4vw,40px);box-sizing:border-box"

def sep():
    glyph = (f'<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="34" height="18" viewBox="0 0 34 18">'
             f'<rect x="1" y="1" width="8" height="16" fill="none" stroke="{FOREST}" stroke-width="1.2"></rect>'
             f'<rect x="13" y="1" width="8" height="16" fill="{SAGE}" stroke="{FOREST}" stroke-width="1.2"></rect>'
             f'<rect x="25" y="1" width="8" height="16" fill="none" stroke="{FOREST}" stroke-width="1.2"></rect></svg>')
    return (f'<div aria-hidden="true" class="sep" style="{WRAP};display:flex;align-items:center;gap:18px">'
            f'<div style="flex:1;height:1px;background:{SAND}"></div>{glyph}<div style="flex:1;height:1px;background:{SAND}"></div></div>')

def bullet(t):
    return (f'<li style="display:flex;gap:14px;align-items:flex-start"><span aria-hidden="true" style="flex:0 0 8px;height:8px;margin-top:11px;background:{SAGE};outline:1px solid {FOREST};outline-offset:0"></span>'
            f'<span style="font-size:clamp(17px,1.6vw,19px);line-height:1.6;color:{FOREST}">{t}</span></li>')

html = []
A = html.append
A('''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Notice de pose Murelle</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500&amp;family=Work+Sans:wght@400;500;600&amp;family=IBM+Plex+Mono:wght@400;500&amp;display=swap" rel="stylesheet">
<style>
body{margin:0;background:#F4EFE5}
a{color:#343C32}a:hover{color:#1F241E}
.mat-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:32px 20px}
.tbl-box{overflow-x:auto;-webkit-overflow-scrolling:touch}
@media (max-width:760px){.mat-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.hide-sm{display:none}}
@media print{
  @page{size:A4;margin:14mm}
  *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  body{background:#fff}
  .step,.card,.pre-item,.hero-fig,.tbl-box{break-inside:avoid;page-break-inside:avoid}
  .step{padding-block:24px !important}
  .step-fig{flex-basis:300px !important;max-width:320px !important}
  .sep{display:none !important}
  h1{font-size:44px !important}
}
</style>
</helmet>
''')
A(f'<div style="background:{CREAM};color:{FOREST};font-family:{FONT_UI};-webkit-font-smoothing:antialiased">')

# En-tête
A(f'<header style="{WRAP};padding-block:28px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px">'
  f'<div style="font-weight:500;letter-spacing:.34em;font-size:20px;color:{FOREST}">MURELLE</div>'
  f'<div style="{LABEL}">L\'art de transformer vos murs</div></header>')

# 1. Ouverture
A(f'<section style="{WRAP};padding-top:clamp(36px,5vw,64px);padding-bottom:clamp(40px,5vw,64px);border-top:1px solid {SAND};display:flex;flex-direction:column;gap:clamp(28px,4vw,44px)">')
A(f'<div style="display:flex;flex-direction:column;gap:20px;max-width:820px">'
  f'<div style="{LABEL}">Notice de pose · Essentielle, Signature, Prestige</div>'
  f'<h1 style="margin:0;font-family:{FONT_H};font-weight:400;font-size:clamp(44px,6.4vw,80px);line-height:1;letter-spacing:-.025em;color:{FOREST};text-wrap:balance">Posez votre panorama, lé après lé</h1>'
  f'<p style="margin:0;font-size:clamp(19px,1.9vw,22px);line-height:1.55;max-width:640px;color:{FOREST}">Huit étapes pour passer d\'un mur nu à un décor continu. Chaque lé porte un numéro : posez-les dans l\'ordre.</p></div>')
A(f'<figure class="hero-fig" style="margin:0;display:flex;flex-direction:column;gap:0;border:1px solid {SAND}">{hero_svg()}'
  f'<figcaption style="background:{SURFACE};border-top:1px solid {SAND};padding:clamp(18px,2.4vw,28px);display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px 32px">'
  f'<div style="display:flex;gap:14px;align-items:flex-start"><span aria-hidden="true" style="flex:0 0 34px;height:34px;border-radius:50%;background:{FOREST};color:{CREAM};display:flex;align-items:center;justify-content:center;font-weight:600;font-size:16px">1</span><span style="font-size:17px;line-height:1.5"><strong style="font-weight:600">Le lé n°1 se pose en premier</strong>, à gauche, contre la ligne d\'aplomb.</span></div>'
  f'<div style="display:flex;gap:14px;align-items:flex-start"><span aria-hidden="true" style="flex:0 0 34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:22px;color:{FOREST}">→</span><span style="font-size:17px;line-height:1.5"><strong style="font-weight:600">Puis 2, 3, 4…</strong> dans l\'ordre des numéros, bord à bord.</span></div>'
  f'<div style="display:flex;gap:14px;align-items:flex-start"><span aria-hidden="true" style="flex:0 0 34px;height:34px;display:flex;align-items:center;justify-content:center;font-family:{FONT_M};font-size:13px;border:1px solid {FOREST}">50</span><span style="font-size:17px;line-height:1.5"><strong style="font-weight:600">Un lé mesure 50 cm de large.</strong> Exemple : un mur de 340 cm reçoit 7 lés.</span></div>'
  f'</figcaption></figure>')
A(f'<ol style="margin:0;padding:0;list-style:none;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:0;border-top:1px solid {FOREST}">')
for i, t in enumerate(["Les lés sont numérotés dans l'ordre de pose.", "Un lé à la fois : encollez, posez, lissez.", "Bord à bord, sans chevauchement."]):
    A(f'<li style="display:flex;gap:16px;align-items:baseline;padding:20px 20px 20px 0;border-bottom:1px solid {SAND}"><span aria-hidden="true" style="font-family:{FONT_M};font-size:14px;color:{MUTED}">0{i+1}</span>'
      f'<span style="font-family:{FONT_H};font-size:clamp(22px,2.2vw,26px);line-height:1.25;color:{FOREST}">{t}</span></li>')
A('</ol></section>')
A(sep())

# 2. Avant de commencer
A(f'<section style="{WRAP};padding-block:clamp(48px,6vw,80px);display:flex;flex-direction:column;gap:36px">'
  f'<div style="display:flex;flex-direction:column;gap:12px"><div style="{LABEL}">Avant de commencer</div><h2 style="{H2}">Quatre vérifications, cinq minutes</h2>'
  f'<p style="margin:0;font-size:clamp(18px,1.7vw,20px);line-height:1.55;max-width:620px">À faire dès réception, avant d\'ouvrir la colle. Un lé encollé est difficile à remplacer.</p></div>'
  f'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:20px">')
for key, title, text in [
    ('count', 'Tous les lés sont présents', 'Comptez-les : leur nombre correspond à celui indiqué dans votre commande.'),
    ('order', 'La numérotation se suit', 'Rangez-les du n°1 au dernier, sans numéro manquant.'),
    ('motif', 'Le motif est le bon', 'Comparez le motif et les dimensions avec votre confirmation de commande.'),
    ('space', 'L\'espace est prêt', 'Mur dégagé, sol protégé, matériel à portée de main.')]:
    A(f'<div class="pre-item" style="background:{SURFACE};border:1px solid {SAND};padding:26px;display:flex;flex-direction:column;gap:14px">'
      f'<div style="width:72px;height:72px;border-radius:50%;background:{TAN};display:flex;align-items:center;justify-content:center">{PICTOS[key]}</div>'
      f'<h3 style="margin:0;font-family:{FONT_H};font-weight:500;font-size:24px;line-height:1.2;color:{FOREST}">{title}</h3>'
      f'<p style="margin:0;font-size:17px;line-height:1.55">{text}</p></div>')
A('</div>')
# Matériel
A(f'<div style="display:flex;flex-direction:column;gap:28px;padding-top:28px;border-top:1px solid {SAND}"><h3 style="margin:0;font-family:{FONT_H};font-weight:400;font-size:clamp(26px,2.8vw,32px);color:{FOREST}">Le matériel</h3><div class="mat-grid">')
for ic, lab in zip(mat_icons, mat_labels):
    A(f'<div style="display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center"><div style="width:84px;height:84px;border-radius:50%;background:{TAN};display:flex;align-items:center;justify-content:center">{ic}</div>'
      f'<div style="font-size:16px;line-height:1.4;color:{FOREST}">{lab}</div></div>')
A('</div></div>')
# Selon votre gamme (à valider fournisseur)
PH = f'<span style="font-family:{FONT_M};font-size:13px;color:{MUTED}">[À CONFIRMER]</span>'
A(f'<div style="display:flex;flex-direction:column;gap:16px;padding-top:28px;border-top:1px solid {SAND}">'
  f'<h3 style="margin:0;font-family:{FONT_H};font-weight:400;font-size:clamp(26px,2.8vw,32px);color:{FOREST}">Selon votre gamme</h3>'
  f'<p style="margin:0;font-size:17px;line-height:1.55;max-width:640px">Votre gamme figure sur votre confirmation de commande. Colle, méthode et séchage peuvent varier d\'une matière à l\'autre.</p>'
  f'<div class="tbl-box" style="border:1px solid {SAND};background:{SURFACE}"><table style="width:100%;min-width:640px;border-collapse:collapse;font-size:16px;line-height:1.45">'
  f'<thead><tr style="text-align:left">' + ''.join(f'<th scope="col" style="{LABEL};font-weight:500;padding:14px 16px;border-bottom:1px solid {FOREST}">{h}</th>' for h in ['Gamme', 'Colle', 'Méthode de pose', 'Séchage', 'Entretien']) + '</tr></thead><tbody>')
for g, m in [('Essentielle', 'Intissé UV'), ('Signature', 'Intissé HP Latex'), ('Prestige', 'Soie HP Latex')]:
    A(f'<tr><th scope="row" style="text-align:left;padding:14px 16px;border-bottom:1px solid {SAND};font-weight:400"><span style="display:block;font-family:{FONT_H};font-size:21px;color:{FOREST}">{g}</span><span style="font-family:{FONT_M};font-size:12px;color:{MUTED}">{m}</span></th>'
      + ''.join(f'<td style="padding:14px 16px;border-bottom:1px solid {SAND}">{PH}</td>' for _ in range(4)) + '</tr>')
A('</tbody></table></div></div></section>')
A(sep())

# 3. Les huit étapes
A(f'<div style="{WRAP};padding-top:clamp(48px,6vw,72px)"><div style="{LABEL}">La pose</div><h2 style="{H2};margin-top:12px">Huit étapes</h2></div>')
for idx, ((num, title, lead, items), svg) in enumerate(zip(steps, step_svgs)):
    border = f'border-top:1px solid {SAND};' if idx else ''
    A(f'<section class="step" style="{WRAP};padding-block:clamp(40px,5vw,64px);{border}display:flex;flex-wrap:wrap;gap:clamp(28px,4vw,56px);align-items:center">'
      f'<div class="step-fig" style="flex:1 1 420px;max-width:560px;min-width:0">{svg}</div>'
      f'<div style="flex:1 1 380px;min-width:0;display:flex;flex-direction:column;gap:18px">'
      f'<div style="{LABEL}">Étape {num} / 08</div>'
      f'<div style="display:flex;align-items:baseline;gap:18px"><span aria-hidden="true" style="font-family:{FONT_H};font-size:clamp(52px,5.4vw,72px);font-weight:400;color:{FOREST};line-height:1;opacity:.9">{num}</span>'
      f'<h2 style="margin:0;font-family:{FONT_H};font-weight:400;font-size:clamp(30px,3.4vw,42px);line-height:1.1;letter-spacing:-.015em;color:{FOREST}">{title}</h2></div>'
      f'<p style="margin:0;font-size:clamp(19px,1.9vw,21px);line-height:1.5;font-weight:500;color:{FOREST}">{lead}</p>'
      f'<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:12px">' + ''.join(bullet(t) for t in items) + '</ul></div></section>')
A(sep())

# 4. Bon à savoir
A(f'<section style="{WRAP};padding-block:clamp(48px,6vw,80px);display:flex;flex-direction:column;gap:32px">'
  f'<div style="display:flex;flex-direction:column;gap:12px"><div style="{LABEL}">Après la pose</div><h2 style="{H2}">Bon à savoir</h2></div>'
  f'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px">')
cards = [
    ('clean', 'Entretien', 'Un chiffon humide suffit', '<p style="margin:0">Essuyez délicatement la surface avec un chiffon humide.</p>'),
    ('humid', 'Pièces humides', 'Pas de douche ni de salle de bain très humide', '<p style="margin:0">Nos papiers peints ne sont pas prévus pour les pièces exposées à l\'eau en permanence.</p>'),
    ('help', 'Besoin d\'aide', 'Le service client MURELLE vous répond', '<p style="margin:0">Un défaut, une question sur le raccord ou sur votre mur ? Écrivez-nous avec une photo, de préférence avant la pose : [ADRESSE E-MAIL MURELLE].</p>'
     f'<p style="margin:0;font-size:15px"><a href="https://murelle.fr/pages/contact" style="color:{FOREST};text-decoration:underline;text-decoration-color:{SAGE};text-underline-offset:3px">Page contact : murelle.fr/pages/contact</a></p>'),
]
for key, lab, title, body in cards:
    small = PICTOS[key].replace('width="52" height="52"', 'width="40" height="40"')
    A(f'<div class="card" style="background:{SURFACE};border:1px solid {SAND};border-top:3px solid {FOREST};padding:clamp(24px,2.6vw,32px);display:flex;flex-direction:column;gap:14px;box-sizing:border-box">'
      f'<div style="display:flex;align-items:center;justify-content:space-between;gap:12px"><div style="{LABEL}">{lab}</div>{small}</div>'
      f'<h3 style="margin:0;font-family:{FONT_H};font-weight:400;font-size:clamp(24px,2.3vw,28px);line-height:1.2;color:{FOREST}">{title}</h3>'
      f'<div style="font-size:17px;line-height:1.6;color:{FOREST};display:flex;flex-direction:column;gap:12px">{body}</div></div>')
A('</div></section>')

# Pied
A(f'<footer style="background:{FOREST};color:{CREAM};padding:36px clamp(20px,4vw,40px)"><div style="max-width:1120px;margin:0 auto;display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;align-items:center">'
  f'<div style="font-weight:500;letter-spacing:.34em;font-size:18px">MURELLE</div><div style="font-size:15px;letter-spacing:.04em">Papier peint panoramique sur mesure · murelle.fr</div></div></footer>')
A('</div>\n</x-dc>\n<script type="text/x-dc" data-dc-script data-props=\'{"$preview":{"width":1280,"height":8400}}\'>\nclass Component extends DCLogic {\nrenderVals() {\nreturn {};\n}\n}\n</script>\n</body>\n</html>\n')
open(OUT, 'w', encoding='utf-8').write('\n'.join(html))
print('ok', len('\n'.join(html)))

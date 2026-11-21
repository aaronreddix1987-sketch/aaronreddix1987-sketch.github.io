"""Draws one 1080x1350 image card per post in queue.json (run once, or after editing hooks)."""
import json, os, textwrap
from PIL import Image, ImageDraw, ImageFont
H=os.path.dirname(os.path.abspath(__file__)); F="/usr/share/fonts/truetype/lato/"
W,Ht=1080,1350; BG=(11,15,20); GOLD=(217,173,85); INK=(238,242,246); MUTED=(163,176,189)
def font(n,s): return ImageFont.truetype(F+n,s)
for p in json.load(open(os.path.join(H,"queue.json"))):
    im=Image.new("RGB",(W,Ht),BG); d=ImageDraw.Draw(im)
    d.rectangle([80,96,200,104],fill=GOLD)
    d.text((80,128),"AI FRONT OFFICE",font=font("Lato-Bold.ttf",34),fill=GOLD)
    size=92
    while True:
        f=font("Lato-Black.ttf",size); lines=[]
        for para in [p["hook"]]:
            words=para.split(); cur=""
            for w in words:
                t=(cur+" "+w).strip()
                if d.textlength(t,font=f)<=W-160: cur=t
                else: lines.append(cur); cur=w
            lines.append(cur)
        lh=int(size*1.18)
        if len(lines)*lh<=760 or size<=52: break
        size-=4
    y=(Ht-len(lines)*lh)//2-20
    for l in lines: d.text((80,y),l,font=f,fill=INK); y+=lh
    d.line([80,Ht-210,W-80,Ht-210],fill=(58,71,88),width=2)
    d.text((80,Ht-180),"Total Transformation Inc.",font=font("Lato-Bold.ttf",38),fill=INK)
    d.text((80,Ht-128),"7-day pilot  ·  $97  ·  Los Angeles",font=font("Lato-Regular.ttf",32),fill=MUTED)
    im.save(os.path.join(H,"img",p["id"]+".jpg"),quality=88)
print("cards done")

"""Deterministic, original Korean research reel. Run: python render.py.
All scientific shapes are conceptual illustrations, not experimental data.
"""
from pathlib import Path
from functools import lru_cache
import math, subprocess, wave, argparse
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'output'
OUT.mkdir(exist_ok=True)
W, H, FPS, DURATION = 1920, 1080, 60, 15
INK = (10, 18, 22)
WHITE = (238, 241, 225)
MINT = (183, 255, 98)
TEAL = (81, 214, 192)
ORANGE = (255, 110, 62)
MUTED = (131, 151, 147)
rng = np.random.default_rng(89)
N = 2300
u = rng.uniform(-1, 1, N)
a = rng.uniform(0, 2*np.pi, N)
rad = rng.uniform(.80, 1, N)
SPHERE = np.column_stack((np.sqrt(1-u*u)*np.cos(a), u, np.sqrt(1-u*u)*np.sin(a))) * rad[:,None]
GROUP = rng.integers(0, 8, N)
centers = np.array([[-.7,-.4],[-.1,-.65],[.55,-.4],[.75,.2],[.15,.6],[-.5,.5],[-.8,.1],[0,0]])
CLUSTERS = centers[GROUP] + rng.normal(0, .115, (N,2))
SIZES = rng.uniform(1, 3.3, N)

def clamp(x): return max(0., min(1., x))
def ease(x): x=clamp(x); return 1-(1-x)**4
def smooth(x): x=clamp(x); return x*x*(3-2*x)
def mix(a,b,p): return a+(b-a)*p

@lru_cache(None)
def font(size, bold=True):
    return ImageFont.truetype(str(ROOT/'assets'/('Pretendard-ExtraBold.ttf' if bold else 'Pretendard-Medium.ttf')), size)

@lru_cache(maxsize=400)
def lettering(s, size, color, bold=True):
    f=font(size,bold)
    b=f.getbbox(s)
    im=Image.new('RGBA',(b[2]-b[0]+12,b[3]-b[1]+12))
    ImageDraw.Draw(im).text((6-b[0],6-b[1]),s,font=f,fill=color)
    return im

def text(im,s,x,y,size=32,color=WHITE,alpha=1,scale=1,bold=True):
    if alpha<=0: return
    l=lettering(s,size,color,bold)
    if abs(scale-1)>.002: l=l.resize((max(1,int(l.width*scale)),max(1,int(l.height*scale))),Image.Resampling.BICUBIC)
    if alpha<.999:
        l=l.copy(); l.putalpha(l.getchannel('A').point(lambda p:int(p*clamp(alpha))))
    im.paste(l,(round(x),round(y)),l)

def reveal(im,s,x,y,size,local,delay=0,color=WHITE):
    q=ease((local-delay)/.65)
    if q<=0: return
    l=lettering(s,size,color)
    # A moving baseline mask: letters physically rise from the lower edge.
    mask=Image.new('RGBA',(l.width,l.height))
    mask.paste(l,(0,int((1-q)*l.height)))
    im.paste(mask,(int(x),int(y)),mask)

def line(d,xy,fill,width=1): d.line(xy,fill=fill,width=width)

def background(t,light=False):
    bg=Image.new('RGB',(W,H),WHITE if light else INK)
    d=ImageDraw.Draw(bg)
    c=(221,226,212) if light else (20,34,36)
    for x in range(80,W,120): line(d,[(x,80),(x,H-80)],c)
    for y in range(80,H,120): line(d,[(80,y),(W-80,y)],c)
    return bg

def chrome(im,t,chapter,light=False):
    d=ImageDraw.Draw(im); c=INK if light else WHITE; muted=(94,111,101) if light else MUTED
    text(im,'SJK  /  RESEARCH IN MOTION',78,46,23,c,bold=False)
    text(im,chapter,1420,46,23,c,bold=False)
    line(d,[(84,96),(1836,96)],muted)
    line(d,[(84,990),(1836,990)],muted)
    line(d,[(84,990),(84+1752*t/15,990)],INK if light else MINT,4)
    text(im,'강성준  ·  계산면역학 연구자',78,1015,22,c,bold=False)
    text(im,f'{min(14,int(t)):02d}:{int((t%1)*60):02d}   /   00:15',1645,1015,22,c,bold=False)

def cloud(im,t,cx,cy,r,mode=0,opacity=1):
    theta=t*.28
    co,si=np.cos(theta),np.sin(theta)
    p=SPHERE.copy()
    x=p[:,0]*co+p[:,2]*si
    z=-p[:,0]*si+p[:,2]*co
    y=p[:,1]
    perspective=2.7/(2.7-z*.3)
    x=x*perspective; y=y*perspective
    if mode:
        x=x*(1-mode)+CLUSTERS[:,0]*mode
        y=y*(1-mode)+CLUSTERS[:,1]*mode
    x=cx+x*r; y=cy+y*r
    d=ImageDraw.Draw(im)
    palette=[MINT,TEAL,ORANGE,(111,159,241),(217,200,255),WHITE,(112,192,122),(242,197,99)]
    for i in np.argsort(z):
        b=(.28+.72*(z[i]+1)/2)*opacity
        col=palette[GROUP[i]] if mode>.1 else (TEAL if i%5 else MINT)
        col=tuple(int(INK[k]+(col[k]-INK[k])*b) for k in range(3))
        rr=SIZES[i]*(.65+.45*(z[i]+1))
        d.ellipse((x[i]-rr,y[i]-rr,x[i]+rr,y[i]+rr),fill=col)
    # Slow latitude curves make the molecular volume legible.
    if mode<.8:
        for lat in [-.55,0,.55]:
            points=[]
            for aa in np.linspace(0,2*np.pi,150):
                xx=np.sqrt(1-lat*lat)*np.cos(aa); zz=np.sqrt(1-lat*lat)*np.sin(aa)
                points.append((cx+(xx*co+zz*si)*r,cy+lat*r*.92+(xx*si-zz*co)*r*.16))
            d.line(points,fill=(36,79,65),width=1)

def cross(d,x,y,c=TEAL):
    line(d,[(x-10,y),(x+10,y)],c,2); line(d,[(x,y-10),(x,y+10)],c,2)

def scene0(t):
    im=background(t); d=ImageDraw.Draw(im)
    q=ease(t/.95)
    cloud(im,t,1360,535,mix(730,350,q))
    # Scanning reticle, independently moving from the cell.
    d.arc((960,135,1760,935),int(t*35),int(t*35)+245,fill=TEAL,width=2)
    for x,y in [(945,155),(1780,910)]: cross(d,x,y)
    text(im,'01  /  생명에서 시작하다',92,172,27,MINT,alpha=ease(t/.45),bold=False)
    reveal(im,'세포를 읽고,',88,292,138,t,.12)
    reveal(im,'가능성을 열다.',88,448,138,t,.32)
    text(im,'실험 면역학 × 단일세포 데이터 × AI',96,674,34,WHITE,alpha=ease((t-.85)/.5),bold=False)
    text(im,'한 세포의 신호에서, 다음 연구의 질문으로.',96,735,26,MUTED,alpha=ease((t-1.1)/.5),bold=False)
    text(im,'CELL → SIGNAL',1240,902,23,MINT,bold=False)
    chrome(im,t,'01   /   DISCOVER')
    return im

def scene1(t):
    s=t-3; im=background(t); d=ImageDraw.Draw(im)
    cloud(im,t,1375,535,365,mode=smooth(s/1.4))
    text(im,'02  /  실험과 계산을 연결하다',92,174,27,MINT,bold=False)
    reveal(im,'면역학',88,294,164,s,.05)
    reveal(im,'× 데이터 × AI',88,478,123,s,.23)
    for i,label in enumerate(['단일세포 분석','공간 전사체','멀티모달 딥러닝']):
        q=ease((s-.55-i*.14)/.45)
        x=98+i*274
        d.rounded_rectangle((x,709+(1-q)*60,x+252,774+(1-q)*60),radius=32,outline=TEAL,width=2)
        text(im,label,x+19,726+(1-q)*60,27,WHITE,alpha=q,bold=False)
    text(im,'실험 설계부터 Python · R 분석까지',96,852,29,MUTED,alpha=ease((s-.9)/.5),bold=False)
    text(im,'SINGLE CELL / SPATIAL / MULTIMODAL',1160,902,21,MINT,bold=False)
    chrome(im,t,'02   /   CONNECT')
    return im

def scene2(t):
    s=t-6; im=background(t,True); d=ImageDraw.Draw(im)
    text(im,'03  /  연구의 스케일을 넓히다',92,173,27,INK,bold=False)
    q=ease(s/.9)
    text(im,'700+',78,284,265,INK,scale=.88+.12*q,alpha=q)
    text(im,'명 이상의 공여자',100,579,43,INK,alpha=q)
    text(im,'8',936,284,265,INK,alpha=ease((s-.2)/.65))
    text(im,'개 장기',951,579,43,INK,alpha=ease((s-.3)/.65))
    line(d,[(875,299),(875,650)],(170,184,163),2)
    # A living eight-organ matrix, explicitly abstract rather than a data plot.
    for j in range(8):
        for k in range(9):
            x=1255+k*58; y=309+j*48
            p=ease((s-.22-j*.07-k*.025)/.5)
            rr=(8+5*math.sin(j*2+k+t))*p
            d.ellipse((x-rr,y-rr,x+rr,y+rr),fill=INK if (j+k)%4 else (94,149,66))
    reveal(im,'면역질환 아틀라스, 함께 구축하다.',96,753,55,s,.48,color=INK)
    text(im,'SCAID 프로젝트 참여  ·  다기관 시료 품질관리 및 연구 조율',100,849,29,INK,alpha=ease((s-.65)/.5),bold=False)
    chrome(im,t,'03   /   SCALE',True)
    return im

def antibody(im,t,progress):
    d=ImageDraw.Draw(im)
    c=np.array([1400.,580.])
    segments=[((0,225),(0,0)),((0,0),(-155,-170)),((0,0),(155,-170)),((-155,-170),(-220,-235)),((155,-170),(220,-235))]
    angle=.08*math.sin(t*1.8)
    rot=np.array([[math.cos(angle),-math.sin(angle)],[math.sin(angle),math.cos(angle)]])
    for j,(aa,bb) in enumerate(segments):
        a=np.array(aa)@rot+c; b=np.array(bb)@rot+c
        q=ease((progress-j*.06)/.7)
        b=a+(b-a)*q
        for width,col in [(36,(25,54,44)),(18,MINT),(5,WHITE)]:
            d.line([tuple(a),tuple(b)],fill=col,width=width)
        d.ellipse((b[0]-11,b[1]-11,b[0]+11,b[1]+11),fill=WHITE)
    for j in range(3):
        rr=280+j*40+math.sin(t*2+j)*12
        d.arc((1400-rr,570-rr,1400+rr,570+rr),t*28+j*100,t*28+j*100+105,fill=TEAL,width=2)
    text(im,'anti-CD40',1285,884,32,MINT)

def scene3(t):
    s=t-9; im=background(t); d=ImageDraw.Draw(im)
    text(im,'04  /  발견을 후보물질로 잇다',92,173,27,MINT,bold=False)
    reveal(im,'데이터에서',88,291,130,s,.02)
    reveal(im,'치료의 가능성으로.',88,443,101,s,.19)
    text(im,'항체 후보 평가 · 기능 검증 · 전임상 연구',97,618,32,WHITE,alpha=ease((s-.5)/.4),bold=False)
    q=ease((s-.6)/.5)
    line(d,[(100,731),(985,731)],MUTED)
    text(im,'17',95,767,100,MINT,alpha=q)
    text(im,'편의 동료심사 논문',245,803,30,WHITE,alpha=q,bold=False)
    text(im,'서울대학교 의생명과학 박사',98,907,27,MUTED,alpha=q,bold=False)
    antibody(im,t,s)
    chrome(im,t,'04   /   TRANSLATE')
    return im

def scene4(t):
    s=t-12; im=background(t); d=ImageDraw.Draw(im)
    # The cell contracts into a signature halo, leaving a calm final reading window.
    cloud(im,t,1470,521,mix(520,292,ease(s/.9)),opacity=.66)
    text(im,'실험의 깊이. 데이터의 확장.',99,195,43,MINT,alpha=ease(s/.6))
    for j,char in enumerate('강성준'):
        q=ease((s-.08-j*.10)/.7)
        text(im,char,83+j*249,328+(1-q)*180,252,WHITE,alpha=q)
    text(im,'SEONG-JUN KANG, Ph.D.',101,624,41,WHITE,alpha=ease((s-.45)/.5),bold=False)
    text(im,'계산면역학  ·  단일세포·공간 오믹스  ·  AI',103,702,34,MUTED,alpha=ease((s-.6)/.5),bold=False)
    q=ease((s-.75)/.45)
    d.rounded_rectangle((103,824,813,911),radius=43,fill=MINT)
    text(im,'kangseongjun.com',140,847,40,INK,alpha=q)
    line(d,[(734,868),(774,868)],INK,3)
    line(d,[(762,856),(774,868),(762,880)],INK,3)
    text(im,'BOSTON, MA',1478,901,24,MINT,bold=False)
    chrome(im,t,'05   /   SEONG-JUN KANG')
    return im

SCENES=[scene0,scene1,scene2,scene3,scene4]

def frame(t):
    idx=min(4,int(t/3)); im=SCENES[idx](t)
    # A swift diagonal travelling shutter bridges each cut on the music downbeat.
    for cut in [3,6,9,12]:
        dt=t-cut
        if -.15<dt<.18:
            p=(dt+.15)/.33
            x=-1100+p*4200
            d=ImageDraw.Draw(im)
            col=MINT if cut!=6 else WHITE
            d.polygon([(x-760,0),(x,0),(x-460,H),(x-1220,H)],fill=col)
            d.polygon([(x+25,0),(x+55,0),(x-405,H),(x-435,H)],fill=ORANGE)
    if t<.15:
        im=Image.blend(Image.new('RGB',(W,H),INK),im,ease(t/.15))
    return im

def soundtrack():
    sr=48000; duration=15; n=sr*duration
    music=np.zeros((n,2),dtype=np.float64)
    random=np.random.default_rng(26)
    def add(start,signal,gain=1,pan=0):
        i=int(start*sr); end=min(n,i+len(signal))
        if end<=i:return
        sig=signal[:end-i]*gain
        music[i:end,0]+=sig*math.sqrt((1-pan)/2)
        music[i:end,1]+=sig*math.sqrt((1+pan)/2)
    # 120 BPM; six beats per chapter. Original D-minor electronic score.
    for k in range(29):
        start=k*.5
        tt=np.arange(int(.42*sr))/sr
        phase=2*np.pi*(46*tt+90*.025*(1-np.exp(-tt/.025)))
        kick=np.sin(phase)*np.exp(-tt*12)
        add(start,kick,.7 if k%6==0 else .48)
        tt=np.arange(int(.16*sr))/sr
        if k%2:
            noise=random.normal(0,1,len(tt)); noise=np.concatenate(([0],np.diff(noise)))
            snare=(noise*.12+np.sin(2*np.pi*185*tt)*.3)*np.exp(-tt*26)
            add(start,snare,.55)
    for k in range(116):
        tt=np.arange(int(.055*sr))/sr
        noise=random.normal(0,1,len(tt))
        hat=np.concatenate(([0],np.diff(noise)))*np.exp(-tt*90)
        add(k*.125,hat,.023 if k%2 else .04,pan=(-.5 if k%2 else .5))
    roots=[73.416,87.307,65.406,97.999,73.416]
    notes=[293.665,349.228,440,587.330,440,349.228]
    for j,root in enumerate(roots):
        tt=np.arange(3*sr)/sr
        env=np.minimum(1,tt/.12)*np.minimum(1,(3-tt)/.3)
        pad=sum(np.sin(2*np.pi*root*ratio*tt) for ratio in [2,2.997,4])/3
        add(j*3,pad*env,.13,pan=(-.25 if j%2 else .25))
        for k in range(6):
            tt=np.arange(int(.48*sr))/sr
            freq=notes[k]*(root/73.416)
            tone=(np.sin(2*np.pi*freq*tt)+.3*np.sin(2*np.pi*freq*2*tt))*np.exp(-tt*9)*(1-np.exp(-tt*180))
            add(j*3+k*.5,tone,.16,pan=(k-2.5)/5)
            add(j*3+k*.5+.25,tone,.04,pan=-(k-2.5)/5)
    for cut in [3,6,9,12]:
        tt=np.arange(int(.55*sr))/sr
        noise=random.normal(0,1,len(tt))
        noise=np.convolve(noise,np.ones(18)/18,'same')
        env=np.sin(np.pi*tt/.55)**3
        add(cut-.35,noise*env,.42,pan=-.15)
        tt=np.arange(int(.8*sr))/sr
        add(cut,np.sin(2*np.pi*(42*tt+1.5*(1-np.exp(-tt*14))))*np.exp(-tt*7),.65)
    music=np.tanh(music*1.25)
    fade=np.minimum(1,np.arange(n)/sr/.04)*np.minimum(1,(n-1-np.arange(n))/sr/.6)
    music*=fade[:,None]
    music*=.91/max(.91,float(np.max(np.abs(music))))
    with wave.open(str(OUT/'soundtrack.wav'),'wb') as f:
        f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr)
        f.writeframes((music*32767).astype('<i2').tobytes())

def main():
    parser=argparse.ArgumentParser(); parser.add_argument('--preview',action='store_true'); args=parser.parse_args()
    times=[1.6,4.6,7.6,10.6,13.8]
    thumbs=[]
    for i,t in enumerate(times):
        im=frame(t); im.save(OUT/f'scene-{i+1}.jpg',quality=94)
        thumbs.append(im.resize((768,432),Image.Resampling.LANCZOS))
    board=Image.new('RGB',(1536,1296),INK)
    for i,im in enumerate(thumbs):board.paste(im,((i%2)*768,(i//2)*432))
    text(board,'RESEARCH IN MOTION',825,1010,38,MINT)
    text(board,'15 SECONDS / 1080P / 60 FPS',825,1085,25,WHITE)
    board.save(OUT/'storyboard.jpg',quality=94)
    if args.preview:return
    soundtrack()
    ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
    cmd=[ffmpeg,'-y','-f','rawvideo','-vcodec','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-i',str(OUT/'soundtrack.wav'),'-map','0:v','-map','1:a','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','320k','-t','15','-movflags','+faststart','-metadata','title=강성준 | Research in Motion','-metadata','comment=Source: https://kangseongjun.com — conceptual scientific graphics; original synthesized soundtrack',str(OUT/'Seong-Jun-Kang-KO-15s.mp4')]
    with open(OUT/'render.log','w') as log:
        process=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=log)
        for i in range(FPS*DURATION):
            process.stdin.write(frame(i/FPS).tobytes())
            if i%60==0: print(f'Rendered {i}/{FPS*DURATION} frames',flush=True)
        process.stdin.close()
        if process.wait()!=0: raise RuntimeError('See output/render.log')
    print(OUT/'Seong-Jun-Kang-KO-15s.mp4')

if __name__=='__main__': main()

import numpy as np, wave, json, sys
sr=44100; fin=json.load(open(sys.argv[1]))["fin"]; n=int(sr*fin)
t=np.arange(n)/sr; bpm=100; beat=60/bpm; bar=beat*4
def nota(m): return 440*2**((m-69)/12)
# A – F#m – D – E (La mayor), un acorde por compás
prog=[[57,61,64],[54,57,61],[50,57,62],[52,56,59]]
pad=np.zeros(n); arp=np.zeros(n); pulso=np.zeros(n)
for k in range(int(fin/bar)+1):
    a=int(k*bar*sr); b=min(n,int((k+1)*bar*sr)); 
    if a>=n: break
    tt=np.arange(b-a)/sr; env=np.minimum(1,tt/0.4)*np.minimum(1,(bar-tt)/0.5)
    for m in prog[k%4]:
        f=nota(m); pad[a:b]+=env*(np.sin(2*np.pi*f*tt)+0.3*np.sin(2*np.pi*2*f*tt)+0.12*np.sin(2*np.pi*3*f*tt))
    # arpegio en corcheas, una octava arriba
    notas=[m+12 for m in prog[k%4]]+[prog[k%4][1]+12]
    for j in range(8):
        s=a+int(j*beat/2*sr); e=min(n,s+int(0.45*sr))
        if s>=n: break
        tn=np.arange(e-s)/sr; f=nota(notas[j%4]); arp[s:e]+=np.exp(-tn*7)*(np.sin(2*np.pi*f*tn)+0.25*np.sin(2*np.pi*2*f*tn))
    # pulso suave en cada tiempo (bombo blando)
    for j in range(4):
        s=a+int(j*beat*sr); e=min(n,s+int(0.18*sr))
        if s>=n: break
        tn=np.arange(e-s)/sr; pulso[s:e]+=np.exp(-tn*28)*np.sin(2*np.pi*(55+40*np.exp(-tn*40))*tn)
mix=0.16*pad/3+0.10*arp+0.35*pulso
fade=np.ones(n); fi=int(1.5*sr); fo=int(2.5*sr); fade[:fi]=np.linspace(0,1,fi); fade[-fo:]=np.linspace(1,0,fo)
mix=mix*fade; mix=mix/np.max(np.abs(mix))*0.6
st=np.stack([mix,np.roll(mix,int(0.012*sr))],axis=1)  # leve ancho estéreo
with wave.open(sys.argv[2],"wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((st*32767).astype(np.int16).tobytes())
print("ok",round(fin,1))

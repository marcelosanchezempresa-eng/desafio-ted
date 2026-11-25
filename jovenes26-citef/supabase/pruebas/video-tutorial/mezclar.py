import json,subprocess,sys
V="../video/";H=json.load(open(V+"habla.json"));D=json.load(open("duraciones.json"))
fin=round(max(x["ofs"]+D[x["i"]] for x in H)+1.6,2); json.dump({"fin":fin},open(V+"fin.json","w"))
L=open(V+"lista.txt").read().strip().split("\n");pares=[];i=0
while i<len(L):
    if L[i].startswith("file") and i+1<len(L) and L[i+1].startswith("duration"): pares.append([L[i],float(L[i+1].split()[1])]);i+=2
    else: i+=1
tot=sum(d for _,d in pares[:-1]); pares[-1][1]=max(0.6,fin-tot)
open(V+"lista2.txt","w").write("".join(f"{f}\nduration {d:.3f}\n" for f,d in pares)+pares[-1][0]+"\n")
run=lambda c:subprocess.run(c,check=True)
run(["ffmpeg","-y","-loglevel","error","-f","concat","-safe","0","-i",V+"lista2.txt","-vf","fps=30,scale=720:-2:flags=lanczos,format=yuv420p","-c:v","libx264","-preset","slow","-crf","24","-an",V+"solo-video.mp4"])
run(["./venv/bin/python","musica.py",V+"fin.json",V+"musica.wav"])
ins=[];flt=[]
for k,x in enumerate(H):
    ins+=["-i",f"lineas/{x['i']:02d}.wav"]; ms=int(x["ofs"]*1000)
    flt.append(f"[{k+1}:a]aresample=44100,aformat=channel_layouts=stereo,adelay={ms}|{ms}[v{k}]")
voces="".join(f"[v{k}]" for k in range(len(H)))
flt.append(f"{voces}amix=inputs={len(H)}:normalize=0:duration=longest,apad=whole_dur={fin},atrim=0:{fin},highpass=f=80,acompressor=threshold=-18dB:ratio=3:attack=5:release=120,loudnorm=I=-16:TP=-1.5:LRA=7,aresample=44100,apad=whole_dur={fin},atrim=0:{fin},asplit=2[voz][sc]")
flt.append(f"[0:a]volume=0.32,apad=whole_dur={fin},atrim=0:{fin}[mus]")
flt.append("[mus][sc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[musd]")
flt.append(f"[voz][musd]amix=inputs=2:normalize=0:duration=longest,alimiter=limit=0.95,apad=whole_dur={fin},atrim=0:{fin}[out]")
run(["ffmpeg","-y","-loglevel","error","-i",V+"musica.wav"]+ins+["-filter_complex",";".join(flt),"-map","[out]","-ar","44100","-c:a","pcm_s16le",V+"audio.wav"])
run(["ffmpeg","-y","-loglevel","error","-i",V+"solo-video.mp4","-i",V+"audio.wav","-map","0:v","-map","1:a","-c:v","copy","-c:a","aac","-b:a","128k","-movflags","+faststart",V+"Tutorial-Hito1-Jovenes26-con-voz.mp4"])
print("fin",fin)

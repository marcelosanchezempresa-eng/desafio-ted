import json,sys,time,torch,torchaudio,os
from TTS.tts.configs.xtts_config import XttsConfig
from TTS.tts.models.xtts import Xtts
torch.set_num_threads(4)
cfg=XttsConfig(); cfg.load_json("modelo/config.json")
m=Xtts.init_from_config(cfg); m.load_checkpoint(cfg,checkpoint_dir="modelo",use_deepspeed=False); m.eval()
# referencia: tu voz en trozos (el modelo usa hasta ~30 s por trozo)
os.makedirs("voz/trozos",exist_ok=True)
w,sr=torchaudio.load("voz/referencia.wav"); L=w.shape[1]; seg=sr*24
refs=[]
for k in range(0,L,seg):
    if L-k<sr*6: break
    p=f"voz/trozos/{k//seg}.wav"; torchaudio.save(p,w[:,k:k+seg],sr); refs.append(p)
gpt,spk=m.get_conditioning_latents(audio_path=refs,gpt_cond_len=24,max_ref_length=24)
textos=json.load(open(sys.argv[1],encoding="utf-8")); idx=[int(x) for x in sys.argv[3].split(",")] if len(sys.argv)>3 else range(len(textos))
os.makedirs(sys.argv[2],exist_ok=True)
for i in idx:
    t0=time.time()
    out=m.inference(textos[i],"es",gpt,spk,temperature=0.6,repetition_penalty=5.0,top_p=0.85,speed=1.08,enable_text_splitting=True)
    torchaudio.save(f"{sys.argv[2]}/{i:02d}.wav",torch.tensor(out["wav"]).unsqueeze(0),24000)
    print(i,f"{time.time()-t0:.1f}s",flush=True)

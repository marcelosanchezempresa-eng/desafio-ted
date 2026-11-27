// Cliente falso con la misma forma que supabase-js v2 (solo lo que usa la app). Habla con server.js.
(function(){
const post=(u,b)=>fetch(u,{method:"POST",body:JSON.stringify(b)}).then(r=>r.json());
const me=()=>{try{return localStorage.getItem("mockEmail")}catch(e){return null}};
function builder(table){const st={table,op:"select",filters:[]};const p={
  select(){if(st.op==="select")st.op="select";return p},insert(x){st.op="insert";st.payload=x;return p},upsert(x){st.op="upsert";st.payload=x;return p},
  update(x){st.op="update";st.payload=x;return p},delete(){st.op="delete";return p},eq(c,v){st.filters.push([c,v]);return p},
  order(c,o){st.order={col:c,asc:!(o&&o.ascending===false)};return p},limit(n){st.limit=n;return p},range(a,b){st.offset=a;st.limit=b-a+1;return p},maybeSingle(){st.single=true;return p},
  then(ok,ko){return post("/q",{...st,email:me()}).then(r=>{if(r.error)return{data:null,error:r.error};let d=r.data;if(st.single)d=(d&&d[0])||null;return{data:d,error:null}}).then(ok,ko)}};return p}
window.supabase={createClient(){const cbs=[];const fire=(ev)=>{const s=me()?{user:{email:me()}}:null;cbs.forEach(f=>f(ev,s))};
  return{
  auth:{onAuthStateChange(f){cbs.push(f);setTimeout(()=>f("INITIAL_SESSION",me()?{user:{email:me()}}:null),10);return{data:{subscription:{unsubscribe(){}}}}},
    async signInWithPassword({email,password}){if(password!=="clave1234")return{error:{message:"Invalid login credentials"}};localStorage.setItem("mockEmail",email);fire("SIGNED_IN");return{error:null}},
    async signUp({email,password}){const r=await post("/signup",{email});if(r.error)return{data:{},error:r.error};localStorage.setItem("mockEmail",email);fire("SIGNED_IN");return{data:{session:{user:{email}}},error:null}},async resetPasswordForEmail(){return{error:null}},async updateUser(){return{error:null}},
    async signOut(){localStorage.removeItem("mockEmail");fire("SIGNED_OUT");return{error:null}}},
  storage:{from(bucket){const call=(op,o)=>post("/st",{op,bucket,email:me(),...o}).then(r=>r.error?{data:null,error:r.error}:{data:r.data,error:null});
    return{list(prefix){return call("list",{prefix:prefix||""})},
      async createSignedUrl(p){const r=await call("urls",{paths:[p]});return r.error?r:{data:(r.data&&r.data[0]&&r.data[0].signedUrl)?{signedUrl:r.data[0].signedUrl}:null,error:r.data&&r.data[0]&&r.data[0].error?{message:r.data[0].error}:null}},
      async upload(p,blob){const buf=new Uint8Array(await blob.arrayBuffer());let bin="";for(let i=0;i<buf.length;i+=8192)bin+=String.fromCharCode.apply(null,buf.subarray(i,i+8192));return call("up",{paths:[p],data:btoa(bin)})},
      remove(paths){return call("rm",{paths})},
      createSignedUrls(paths){return call("urls",{paths})}}}},
  rpc:(fn,args)=>post("/rpc",{fn,args,email:me()}).then(r=>r.error?{data:null,error:r.error}:{data:r.data,error:null}),
  from:t=>builder(t),
  channel(){const hs=[];const ch={on(_t,f,cb){hs.push([f.table,cb]);return ch},subscribe(cb){const es=new EventSource("/events");
    es.onmessage=m=>{const p=JSON.parse(m.data);hs.forEach(([t,h])=>{if(t===p.table)h(p)})};es.onopen=()=>cb&&cb("SUBSCRIBED");return ch}};return ch}}}};
})();

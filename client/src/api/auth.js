import{call,withMock}from'./client';
export const login=data=>withMock(()=>call('/auth/login',{method:'POST',body:data,auth:false}),()=>({token:'mock-token',user:{id:'mock-user',fullName:data.email.split('@')[0],email:data.email,preferredLanguage:'en'}}));
export const signup=data=>withMock(()=>call('/auth/signup',{method:'POST',body:data,auth:false}),()=>({token:'mock-token',user:{id:'mock-user',fullName:data.fullName,email:data.email,preferredLanguage:'en'}}));
export const me=()=>withMock(()=>call('/me'),()=>({user:JSON.parse(localStorage.getItem('mock-user')||'null')}));
export const updateMe=data=>withMock(()=>call('/me',{method:'PUT',body:data}),()=>({user:{id:'mock-user',...data}}));

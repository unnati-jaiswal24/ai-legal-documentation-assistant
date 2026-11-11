import{call,withMock}from'./client';import{mockTemplate,mockTypes,mockState,newMockDraft}from'./mock';
export const templates=()=>withMock(()=>call('/templates'),()=>[mockTemplate]);export const documentTypes=()=>withMock(()=>call('/document-types'),()=>mockTypes);
export const drafts=()=>withMock(()=>call('/drafts'),()=>mockState.drafts);export const createDraft=templateId=>withMock(()=>call('/drafts',{method:'POST',body:{templateId}}),()=>newMockDraft(templateId));
export const draft=id=>withMock(()=>call(`/drafts/${id}`),()=>mockState.drafts.find(d=>d.id===id)||newMockDraft());
export const saveValues=(id,values)=>withMock(()=>call(`/drafts/${id}/values`,{method:'PUT',body:{values}}),()=>{const d=mockState.drafts.find(x=>x.id===id);if(d)d.values=values;return{values}});
export const validateDraft=id=>withMock(()=>call(`/drafts/${id}/validate`,{method:'POST'}),()=>({status:'validated'}));
export const generate=id=>withMock(()=>call(`/drafts/${id}/generate`,{method:'POST'}),()=>{const list=mockState.versions[id]||[];const v={id:crypto.randomUUID(),draftId:id,versionNo:list.length+1,fileUrl:'#',format:'pdf',generatedAt:new Date().toISOString()};mockState.versions[id]=[v,...list];return v});
export const versions=id=>withMock(()=>call(`/drafts/${id}/documents`),()=>mockState.versions[id]||[]);

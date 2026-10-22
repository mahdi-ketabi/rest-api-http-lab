export const INITIAL_PRODUCTS=Object.freeze([
  {id:1,title:'شارژر USB-C',price:890000,category:'charger'},
  {id:2,title:'کابل یک متری',price:230000,category:'cable'},
  {id:3,title:'پاوربانک',price:1290000,category:'powerbank'}
]);
const categories=new Set(['charger','cable','powerbank','accessory']);
export class ProductStore {
 constructor(){this.reset()}
 reset(){this.products=INITIAL_PRODUCTS.map(p=>({...p}));this.nextId=4;return this.list()}
 list(){return this.products.map(p=>({...p}))}
 find(id){const result=this.products.find(p=>p.id===id);return result?{...result}:null}
 validate(data,{partial=false}={}){
  if(!data||typeof data!=='object'||Array.isArray(data))return 'بدنه باید یک شیء JSON باشد.';
  const allowed=['title','price','category'];const keys=Object.keys(data);
  if(keys.some(k=>!allowed.includes(k)))return 'فقط title، price و category مجاز هستند.';
  if(partial&&keys.length===0)return 'در PATCH حداقل یک ویژگی لازم است.';
  if(!partial&&allowed.some(k=>!Object.hasOwn(data,k)))return 'title، price و category همگی لازم هستند.';
  if(Object.hasOwn(data,'title')&&(typeof data.title!=='string'||!data.title.trim()||data.title.trim().length>100))return 'title باید متن ۱ تا ۱۰۰ نویسه باشد.';
  if(Object.hasOwn(data,'price')&&(!Number.isSafeInteger(data.price)||data.price<0))return 'price باید عدد صحیح نامنفی باشد.';
  if(Object.hasOwn(data,'category')&&!categories.has(data.category))return 'category نامعتبر است.';
  return null;
 }
 create(data){const error=this.validate(data);if(error)return {error};const item={id:this.nextId++,title:data.title.trim(),price:data.price,category:data.category};this.products.push(item);return {item:{...item}}}
 update(id,data,partial=false){const error=this.validate(data,{partial});if(error)return {error};const index=this.products.findIndex(item=>item.id===id);if(index<0)return {missing:true};const next={...this.products[index],...data};if(Object.hasOwn(data,'title'))next.title=data.title.trim();this.products[index]=next;return {item:{...next}}}
 delete(id){const idx=this.products.findIndex(item=>item.id===id);if(idx<0)return false;this.products.splice(idx,1);return true}
}

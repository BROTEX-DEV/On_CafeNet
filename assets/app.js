(() => {
  const db = () => window.onSupabase;
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const fa = n => new Intl.NumberFormat('fa-IR').format(Number(n||0));
  const money = n => fa(n) + ' تومان';
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icons = ['✦','▣','◈','✧','⌘','◌'];
  const demoProducts = [
    {id:'demo-1',name:'پک آیکون مینیمال',slug:'minimal-icon-pack',description:'مجموعه‌ای مرتب از آیکون‌های ساده برای رابط‌های کاربری و پروژه‌های شخصی.',category:'طراحی',price_toman:89000,image_url:'',is_active:true},
    {id:'demo-2',name:'قالب برنامه‌ریزی دیجیتال',slug:'digital-planner',description:'قالب کاربردی برای نظم دادن به کارها، ایده‌ها و برنامه‌های روزانه.',category:'بهره‌وری',price_toman:129000,image_url:'',is_active:true},
    {id:'demo-3',name:'پک پس‌زمینه خلاقانه',slug:'creative-wallpapers',description:'مجموعه‌ای از پس‌زمینه‌های دیجیتال برای دسکتاپ و موبایل.',category:'گرافیک',price_toman:69000,image_url:'',is_active:true},
    {id:'demo-4',name:'قالب رزومه مدرن',slug:'modern-resume',description:'قالب تمیز و قابل ویرایش برای معرفی حرفه‌ای مهارت‌ها و تجربه‌ها.',category:'قالب آماده',price_toman:99000,image_url:'',is_active:true},
    {id:'demo-5',name:'چک‌لیست شروع پروژه',slug:'project-starter-checklist',description:'یک چک‌لیست ساده برای تبدیل ایده به برنامه اجرایی روشن.',category:'بهره‌وری',price_toman:49000,image_url:'',is_active:true},
    {id:'demo-6',name:'پک عناصر رابط کاربری',slug:'ui-starter-kit',description:'عناصر پایه برای ساخت نمونه‌های اولیه و طراحی سریع‌تر صفحات.',category:'طراحی',price_toman:159000,image_url:'',is_active:true}
  ];
  let products = [];
  let signupMode = false;
  const getCart = () => { try { return JSON.parse(localStorage.getItem('on-store-cart') || '[]'); } catch { return []; } };
  const saveCart = cart => { localStorage.setItem('on-store-cart', JSON.stringify(cart)); updateCartCount(); };
  const updateCartCount = () => { const count = getCart().reduce((n,x)=>n+x.quantity,0); $$('#cart-count').forEach(el=>el.textContent=fa(count)); };
  const addCart = (p) => {
    if (String(p.id).startsWith('demo-')) { toast('برای ثبت سفارش واقعی، ابتدا محصولات را در پنل مدیریت ثبت کن. این محصول نمایشی است.', true); return; }
    const cart=getCart(), old=cart.find(x=>x.id===p.id);
    if(old) old.quantity=Math.min(100,old.quantity+1); else cart.push({id:p.id,quantity:1});
    saveCart(cart); toast('به سبد خرید اضافه شد.');
  };
  function toast(message,error=false){let el=$('#toast');if(!el){el=document.createElement('div');el.id='toast';el.className='toast';document.body.append(el)}el.textContent=message;el.classList.toggle('error',error);el.classList.add('show');clearTimeout(window.__onToast);window.__onToast=setTimeout(()=>el.classList.remove('show'),3500)}
  const card = (p,i=0) => `<article class="product-card"><a href="product.html?id=${encodeURIComponent(p.id)}" class="product-visual">${p.image_url?'<img loading="lazy" src="'+escapeHtml(p.image_url)+'" alt="'+escapeHtml(p.name)+'">':'<span class="visual-symbol">'+icons[i%icons.length]+'</span>'}<span class="product-tag">${escapeHtml(p.category||'دیجیتال')}</span></a><div class="product-info"><span class="product-category">${escapeHtml(p.category||'محصول دیجیتال')}</span><h3><a href="product.html?id=${encodeURIComponent(p.id)}">${escapeHtml(p.name)}</a></h3><p>${escapeHtml(p.description||'محصول دیجیتال برای استفاده روزمره.')}</p><div class="product-bottom"><span class="price">${money(p.price_toman)}<small> · پرداخت در مرحله سفارش</small></span><button class="add-btn" data-add="${escapeHtml(p.id)}" aria-label="افزودن به سبد خرید" title="افزودن به سبد خرید">+</button></div></div></article>`;
  async function loadProducts(){
    try {
      if(!db()) throw new Error('supabase not configured');
      const {data,error}=await db().from('store_products').select('id,name,slug,description,category,price_toman,image_url,is_active,created_at').eq('is_active',true).order('created_at',{ascending:false});
      if(error) throw error;
      products=data||[];
      if(!products.length) products=demoProducts;
    } catch(e){ products=demoProducts; console.info('نمایش محصولات نمونه؛ اتصال دیتابیس یا فهرست محصولات بررسی شود.',e.message); }
    return products;
  }
  function fillProducts(list,container){if(!container)return;container.innerHTML=list.length?list.map(card).join(''):'<div class="empty-state"><h3>محصولی پیدا نشد</h3><p>عبارت جست‌وجو یا فیلتر را تغییر بده.</p></div>'; }
  async function home(){await loadProducts();fillProducts(products.slice(0,3),$('#featured-products'));}
  async function catalog(){
    await loadProducts();const search=$('#product-search'),category=$('#category-filter'),sort=$('#sort-filter'),container=$('#all-products'),count=$('#result-count');
    const cats=[...new Set(products.map(p=>p.category).filter(Boolean))];cats.forEach(c=>category.insertAdjacentHTML('beforeend',`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`));
    const render=()=>{let list=products.filter(p=>(!category.value||p.category===category.value)&&(!search.value.trim()||[p.name,p.description,p.category].join(' ').toLowerCase().includes(search.value.trim().toLowerCase())));if(sort.value==='price-asc')list.sort((a,b)=>a.price_toman-b.price_toman);if(sort.value==='price-desc')list.sort((a,b)=>b.price_toman-a.price_toman);if(sort.value==='name')list.sort((a,b)=>a.name.localeCompare(b.name,'fa'));fillProducts(list,container);count.textContent=fa(list.length)+' محصول';};
    [search,category,sort].forEach(el=>el.addEventListener(el===search?'input':'change',render));render();
  }
  async function productPage(){
    const id=new URLSearchParams(location.search).get('id'), root=$('#product-detail');await loadProducts();
    let p=products.find(x=>x.id===id)||products.find(x=>x.slug===id);
    if(!p||String(p.id).startsWith('demo-')){root.innerHTML='<div class="empty-state"><h3>محصول پیدا نشد</h3><p>این محصول وجود ندارد یا هنوز در فروشگاه ثبت نشده است.</p><a class="btn btn-primary" href="products.html">بازگشت به محصولات</a></div>';return;}
    root.innerHTML=`<div class="product-detail-layout"><div class="detail-visual">${p.image_url?'<img src="'+escapeHtml(p.image_url)+'" alt="'+escapeHtml(p.name)+'">':'<span class="visual-symbol">✦</span>'}</div><div class="detail-copy"><span class="eyebrow">${escapeHtml(p.category||'محصول دیجیتال')}</span><h1>${escapeHtml(p.name)}</h1><p>${escapeHtml(p.description||'توضیحی برای این محصول ثبت نشده است.')}</p><div class="detail-price">${money(p.price_toman)} <small>قیمت محصول</small></div><div class="detail-actions"><button class="btn btn-primary" id="detail-add">افزودن به سبد خرید <span>←</span></button><a class="btn btn-outline" href="products.html">بازگشت</a></div><p class="summary-note">ثبت سفارش آنلاین فعال است؛ پرداخت اینترنتی هنوز به درگاه پرداخت متصل نشده است.</p></div></div>`;
    $('#detail-add').addEventListener('click',()=>addCart(p));
  }
  async function cartPage(){
    const root=$('#cart-content');await loadProducts();
    const render=()=>{
      const cart=getCart().filter(x=>products.some(p=>p.id===x.id)), items=cart.map(x=>({...products.find(p=>p.id===x.id),quantity:x.quantity})), total=items.reduce((s,p)=>s+p.price_toman*p.quantity,0);
      if(!items.length){root.innerHTML='<div class="empty-state"><h3>سبد خریدت خالیه</h3><p>از محصولات فروشگاه چیزی انتخاب کن و دوباره برگرد.</p><a class="btn btn-primary" href="products.html">دیدن محصولات ←</a></div>';return;}
      root.innerHTML='<div class="cart-items">'+items.map(p=>`<article class="cart-item"><div class="cart-thumb">${p.image_url?'<img src="'+escapeHtml(p.image_url)+'" alt="">':icons[products.indexOf(p)%icons.length]}</div><div><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.category||'محصول دیجیتال')}</p><span class="price">${money(p.price_toman)}</span></div><div class="qty-control"><button data-qty="${p.id}" data-delta="-1" aria-label="کم کردن">−</button><span>${fa(p.quantity)}</span><button data-qty="${p.id}" data-delta="1" aria-label="زیاد کردن">+</button></div><button class="remove-item" data-remove="${p.id}">حذف</button></article>`).join('')+'</div><aside class="summary-card"><h2>خلاصه سفارش</h2><div class="summary-row"><span>تعداد محصولات</span><b>'+fa(items.reduce((n,p)=>n+p.quantity,0))+'</b></div><div class="summary-row"><span>هزینه ارسال</span><b>—</b></div><div class="summary-row total"><span>جمع کل</span><b>'+money(total)+'</b></div><section class="onpay-panel" aria-label="ON PAY"><div class="onpay-heading"><span class="onpay-mark">ON<span>PAY</span></span><span class="onpay-badge">فاکتور داخلی</span></div><h3>پرداخت و ثبت سفارش</h3><p>فاکتور در همین فروشگاه ساخته می‌شود. درگاه بانکی هنوز متصل نیست؛ ثبت سفارش به معنی پرداخت موفق نیست.</p><div class="onpay-status"><span>وضعیت پرداخت</span><strong>پرداخت نشده</strong></div></section><p class="summary-note">برای ثبت سفارش، وارد حساب کاربری شو. بعد از ثبت، شماره فاکتور و وضعیت سفارش نمایش داده می‌شود.</p><form class="checkout-form" id="checkout-form"><label>نام و نام خانوادگی<input id="checkout-name" required maxlength="120"></label><label>راه ارتباطی<input id="checkout-contact" required maxlength="120" placeholder="ایمیل یا شماره تماس"></label><label>توضیحات (اختیاری)<textarea id="checkout-note" rows="2" maxlength="500"></textarea></label><button class="btn btn-primary" type="submit">ثبت سفارش و ساخت فاکتور <span>←</span></button><div id="checkout-message" class="auth-message"></div></form></aside>';
      $$('[data-qty]').forEach(b=>b.onclick=()=>{let c=getCart(),it=c.find(x=>x.id===b.dataset.qty);if(it){it.quantity=Math.min(100,it.quantity+Number(b.dataset.delta));if(it.quantity<1)c=c.filter(x=>x.id!==it.id);saveCart(c);render();}});
      $$('[data-remove]').forEach(b=>b.onclick=()=>{saveCart(getCart().filter(x=>x.id!==b.dataset.remove));render();});
      $('#checkout-form').onsubmit=async e=>{
        e.preventDefault();const msg=$('#checkout-message');msg.className='auth-message';msg.textContent='';
        if(!db()){msg.textContent='اتصال به سرویس حساب کاربری برقرار نیست.';msg.classList.add('error');return;}
        const {data:{user}}=await db().auth.getUser();if(!user){location.href='login.html?next=cart.html';return;}
        msg.textContent='در حال ثبت سفارش…';
        try{
          const {data:order,error}=await db().from('store_orders').insert({user_id:user.id,total_toman:total,customer_name:$('#checkout-name').value.trim(),customer_contact:$('#checkout-contact').value.trim(),note:$('#checkout-note').value.trim()}).select().single();
          if(error)throw error;
          const rows=items.map(p=>({order_id:order.id,product_id:p.id,product_name:p.name,unit_price_toman:p.price_toman,quantity:p.quantity}));
          const {error:itemError}=await db().from('store_order_items').insert(rows);if(itemError)throw itemError;
          saveCart([]);root.innerHTML='<section class="onpay-receipt"><div class="onpay-receipt-icon">✓</div><span class="eyebrow">ON PAY / INVOICE</span><h2>فاکتور شما ساخته شد</h2><p>شماره سفارش: <strong>'+escapeHtml(order.id.slice(0,8).toUpperCase())+'</strong></p><div class="onpay-receipt-items">'+items.map(p=>'<div><span>'+escapeHtml(p.name)+' × '+fa(p.quantity)+'</span><b>'+money(p.price_toman*p.quantity)+'</b></div>').join('')+'</div><div class="onpay-receipt-total"><span>مبلغ فاکتور</span><strong>'+money(total)+'</strong></div><div class="onpay-unpaid"><b>وضعیت: پرداخت نشده</b><span>این فاکتور رسید بانکی نیست و هیچ پولی دریافت نشده است. سفارش برای بررسی مدیر ثبت شد.</span></div><a class="btn btn-primary" href="products.html">بازگشت به فروشگاه</a></section>';
        }catch(err){msg.textContent='ثبت سفارش ناموفق بود: '+(err.message||'خطای نامشخص');msg.classList.add('error');}
      };
    };
    render();
  }
  async function loginPage(){
    const form=$('#auth-form'),msg=$('#auth-message'),switchBtn=$('#auth-switch'),submit=$('#auth-submit'),heading=$('#auth-heading'),subtitle=$('#auth-subtitle'),signed=$('#signed-in');
    const setMsg=(s,err=false)=>{msg.textContent=s;msg.classList.toggle('error',err)};
    if(!db()){setMsg('اتصال Supabase آماده نیست؛ تنظیمات را بررسی کن.',true);return;}
    const {data:{session}}=await db().auth.getSession();
    if(session){form.classList.add('hidden');signed.classList.remove('hidden');signed.innerHTML='<b>وارد شدی.</b><p>'+escapeHtml(session.user.email)+'</p><a class="btn btn-primary" href="index.html">رفتن به فروشگاه</a> <a class="btn btn-outline" href="admin.html">پنل مدیریت</a> <button class="btn btn-outline" id="logout-btn">خروج</button>';$('#logout-btn').onclick=async()=>{await db().auth.signOut();location.reload();};}
    switchBtn.onclick=()=>{signupMode=!signupMode;heading.textContent=signupMode?'ساخت حساب کاربری':'ورود به حساب';subtitle.textContent=signupMode?'با ایمیل خودت یک حساب بساز.':'برای پیگیری سفارش‌ها وارد حساب خودت شو.';submit.innerHTML=signupMode?'ساخت حساب <span>←</span>':'ورود <span>←</span>';switchBtn.textContent=signupMode?'ورود به حساب':'ساخت حساب';$('#switch-text').textContent=signupMode?'قبلاً حساب ساخته‌ای؟':'حساب کاربری نداری؟';$('#auth-password').autocomplete=signupMode?'new-password':'current-password';setMsg('');};
    form.onsubmit=async e=>{e.preventDefault();submit.disabled=true;setMsg('در حال انجام…');const email=$('#auth-email').value.trim(),password=$('#auth-password').value;let result;
      try{result=signupMode?await db().auth.signUp({email,password}):await db().auth.signInWithPassword({email,password});if(result.error)throw result.error;
        if(signupMode&&!result.data.session){setMsg('حساب ساخته شد. اگر تأیید ایمیل فعال باشد، ایمیلت را بررسی کن.');}
        else{setMsg('ورود موفق بود. در حال انتقال به صفحه موردنظر…');setTimeout(()=>{const next=new URLSearchParams(location.search).get('next');location.href=['cart.html','admin.html'].includes(next)?next:'index.html';},650);}
      }catch(err){setMsg(err.message||'خطا در ورود یا ساخت حساب.',true);}finally{submit.disabled=false;}
    };
  }
  async function adminPage(){
    const gate=$('#admin-gate'),panel=$('#admin-panel');
    if(!db()){gate.textContent='اتصال Supabase آماده نیست.';return;}
    const {data:{session}}=await db().auth.getSession();
    if(!session){gate.innerHTML='برای ورود به پنل مدیریت ابتدا <a href="login.html?next=admin.html">وارد حساب</a> شو.';return;}
    const {data:admins,error}=await db().from('store_admins').select('user_id').eq('user_id',session.user.id).limit(1);
    if(error){gate.textContent='بررسی دسترسی ناموفق بود: '+error.message;return;}
    if(!admins?.length){gate.innerHTML='این حساب هنوز دسترسی مدیریت ندارد.<br><br>برای فعال‌سازی، ابتدا حساب بساز و سپس شناسه کاربری خود را در جدول <code>store_admins</code> از پنل Supabase اضافه کن. شناسه فعلی: <code>'+escapeHtml(session.user.id)+'</code><br><small>این بررسی سمت سرور انجام می‌شود؛ تغییر ظاهر صفحه دسترسی ادمین ایجاد نمی‌کند.</small>';return;}
    gate.classList.add('hidden');panel.classList.remove('hidden');await loadAdminProducts();await loadAdminOrders();
    $('#admin-signout').onclick=async()=>{await db().auth.signOut();location.href='login.html';};
    $$('[data-admin-tab]').forEach(btn=>btn.onclick=()=>{ $$('[data-admin-tab]').forEach(b=>b.classList.toggle('active',b===btn));$('#admin-products').classList.toggle('hidden',btn.dataset.adminTab!=='products');$('#admin-orders').classList.toggle('hidden',btn.dataset.adminTab!=='orders');});
    const imageFile=$('#admin-image-file'),imageUrl=$('#admin-image'),imagePreview=$('#admin-image-preview');
    const previewImage=url=>{imagePreview.innerHTML=url?'<img src="'+escapeHtml(url)+'" alt="پیش‌نمایش تصویر محصول"><button type="button" id="remove-image-preview" aria-label="پاک کردن تصویر">×</button>':'<span>پیش‌نمایش تصویر</span>';const remove=$('#remove-image-preview');if(remove)remove.onclick=()=>{imageFile.value='';imageUrl.value='';previewImage('');};};
    imageFile.onchange=()=>{const f=imageFile.files?.[0];if(!f){previewImage(imageUrl.value.trim());return;}if(!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>5*1024*1024){imageFile.value='';toast('تصویر باید PNG، JPG یا WEBP و حداکثر ۵ مگابایت باشد.',true);return;}previewImage(URL.createObjectURL(f));};
    imageUrl.oninput=()=>{if(!imageFile.files?.length)previewImage(imageUrl.value.trim());};
    $('#admin-cancel-edit').onclick=()=>{ $('#admin-product-form').reset();$('#edit-product-id').value='';$('#product-form-title').textContent='افزودن محصول جدید';previewImage(''); };
    $('#admin-product-form').onsubmit=async e=>{e.preventDefault();const id=$('#edit-product-id').value;const m=$('#admin-product-message');m.textContent='در حال ذخیره…';m.className='auth-message';const saveButton=$('#admin-product-form button[type="submit"]');saveButton.disabled=true;try{let image_url=imageUrl.value.trim();const file=imageFile.files?.[0];if(file){if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw new Error('تصویر باید PNG، JPG یا WEBP و حداکثر ۵ مگابایت باشد.');m.textContent='در حال آپلود تصویر…';const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';const path='products/'+$('#admin-slug').value.trim()+'-'+Date.now()+'.'+ext;const {error:uploadError}=await db().storage.from('on-product-images').upload(path,file,{contentType:file.type,upsert:false});if(uploadError)throw uploadError;image_url=db().storage.from('on-product-images').getPublicUrl(path).data.publicUrl;imageUrl.value=image_url;}const payload={name:$('#admin-name').value.trim(),slug:$('#admin-slug').value.trim(),category:$('#admin-category').value.trim(),price_toman:Number($('#admin-price').value),image_url,description:$('#admin-description').value.trim(),is_active:$('#admin-active').checked,updated_at:new Date().toISOString()};m.textContent='در حال ذخیره محصول…';const q=id?db().from('store_products').update(payload).eq('id',id):db().from('store_products').insert(payload);const {error}=await q;if(error)throw error;m.textContent='محصول و تصویر با موفقیت ذخیره شدند.';$('#admin-product-form').reset();$('#edit-product-id').value='';$('#product-form-title').textContent='افزودن محصول جدید';$('#admin-active').checked=true;previewImage('');await loadAdminProducts();}catch(err){m.textContent='ذخیره ناموفق: '+(err.message||'خطای نامشخص');m.classList.add('error');}finally{saveButton.disabled=false;}};
  }
  async function loadAdminProducts(){
    const root=$('#admin-product-list'),{data,error}=await db().from('store_products').select('*').order('created_at',{ascending:false});
    if(error){root.innerHTML='<p class="auth-message error">'+escapeHtml(error.message)+'</p>';return;}
    root.innerHTML=data.length?data.map(p=>'<article class="admin-product-row"><div><h3>'+escapeHtml(p.name)+'</h3><p>'+money(p.price_toman)+' · '+escapeHtml(p.category)+' · '+(p.is_active?'نمایش داده می‌شود':'پنهان')+'</p></div><div class="row-actions"><button data-edit="'+p.id+'">ویرایش</button><button class="danger" data-toggle="'+p.id+'" data-active="'+p.is_active+'">'+(p.is_active?'پنهان‌کردن':'نمایش')+'</button></div></article>').join(''):'<div class="empty-state"><h3>هنوز محصولی نداری</h3><p>از فرم بالا اولین محصول را ثبت کن.</p></div>';
    $$('[data-edit]',root).forEach(b=>b.onclick=()=>{const p=data.find(x=>x.id===b.dataset.edit);$('#edit-product-id').value=p.id;$('#admin-name').value=p.name;$('#admin-slug').value=p.slug;$('#admin-category').value=p.category;$('#admin-price').value=p.price_toman;$('#admin-image').value=p.image_url||'';$('#admin-image-file').value='';$('#admin-image-preview').innerHTML=p.image_url?'<img src="'+escapeHtml(p.image_url)+'" alt="تصویر فعلی محصول"><button type="button" id="remove-image-preview" aria-label="پاک کردن تصویر">×</button>':'<span>پیش‌نمایش تصویر</span>';const removePreview=$('#remove-image-preview');if(removePreview)removePreview.onclick=()=>{$('#admin-image-file').value='';$('#admin-image').value='';$('#admin-image-preview').innerHTML='<span>پیش‌نمایش تصویر</span>';};$('#admin-description').value=p.description||'';$('#admin-active').checked=p.is_active;$('#product-form-title').textContent='ویرایش محصول';window.scrollTo({top:0,behavior:'smooth'});});
    $$('[data-toggle]',root).forEach(b=>b.onclick=async()=>{const {error}=await db().from('store_products').update({is_active:b.dataset.active!=='true',updated_at:new Date().toISOString()}).eq('id',b.dataset.toggle);if(error)toast(error.message,true);else await loadAdminProducts();});
  }
  async function loadAdminOrders(){
    const root=$('#admin-order-list');const {data,error}=await db().from('store_orders').select('id,user_id,total_toman,status,customer_name,customer_contact,note,created_at,store_order_items(product_name,unit_price_toman,quantity)').order('created_at',{ascending:false});
    if(error){root.innerHTML='<p class="auth-message error">'+escapeHtml(error.message)+'</p>';return;}
    const labels={pending:'در انتظار بررسی (پرداخت تأیید نشده)',confirmed:'سفارش تأیید شده',delivered:'تحویل شده',cancelled:'لغو شده'};
    root.innerHTML=data.length?data.map(o=>'<article class="admin-order-row"><div><h3>سفارش '+escapeHtml(o.id.slice(0,8))+' · '+escapeHtml(o.customer_name)+'</h3><p>'+escapeHtml(o.customer_contact)+' · '+new Date(o.created_at).toLocaleDateString('fa-IR')+' · '+money(o.total_toman)+'</p><p>'+escapeHtml((o.store_order_items||[]).map(i=>i.product_name+' × '+i.quantity).join('، '))+'</p><small>'+escapeHtml(o.note||'بدون توضیحات')+'</small></div><div class="row-actions"><select class="status-select" data-order-status="'+o.id+'">'+Object.keys(labels).map(s=>'<option value="'+s+'" '+(s===o.status?'selected':'')+'>'+labels[s]+'</option>').join('')+'</select></div></article>').join(''):'<div class="empty-state"><h3>هنوز سفارشی ثبت نشده</h3></div>';
    $$('[data-order-status]',root).forEach(s=>s.onchange=async()=>{const {error}=await db().from('store_orders').update({status:s.value}).eq('id',s.dataset.orderStatus);if(error)toast(error.message,true);else toast('وضعیت سفارش به‌روزرسانی شد.');});
  }
  function setupMenu(){const button=$('.menu-toggle'),nav=$('.nav');if(button&&nav)button.onclick=()=>nav.classList.toggle('open');}
  document.addEventListener('DOMContentLoaded',async()=>{
    updateCartCount();setupMenu();
    const page=document.body.dataset.page;
    if(page==='home')await home();if(page==='products')await catalog();if(page==='product')await productPage();if(page==='cart')await cartPage();if(page==='login')await loginPage();if(page==='admin')await adminPage();
    document.addEventListener('click',e=>{const b=e.target.closest('[data-add]');if(b){const p=products.find(x=>x.id===b.dataset.add);if(p)addCart(p);}});
  });
})();
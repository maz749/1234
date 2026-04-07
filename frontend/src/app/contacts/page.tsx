'use client';
import { useState } from 'react';
import { createOrder } from '@/services/api';
import toast from 'react-hot-toast';

export default function ContactsPage() {
  const [form, setForm] = useState({ name:'', phone:'', email:'', message:'' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await createOrder({ customer_name:form.name, phone:form.phone, email:form.email, message:form.message });
      setSent(true);
      toast.success('Заявка отправлена');
    } catch {
      toast.error('Ошибка отправки');
    }
    setSending(false);
  };

  const inputStyle = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(245,240,232,.1)',
    color: '#f5f0e8',
    padding: '14px 0',
    fontSize: 13,
    outline: 'none',
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 300,
    letterSpacing: '.04em',
    transition: 'border-color .25s',
  } as const;

  return (
    <div style={{ background:'#141210', minHeight:'100vh' }}>

      {/* SPLIT: photo left, form right (Boffi) */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', minHeight:'100vh' }}>

        {/* Photo side */}
        <div style={{ position:'relative', overflow:'hidden' }}>
          <img
            src="https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=1200&q=85&auto=format&fit=crop"
            alt=""
            style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center' }}
          />
          <div style={{ position:'absolute', inset:0, background:'rgba(14,12,10,.52)' }} />
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'60px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
              <span style={{ width:28, height:1, background:'#f5f0e8', display:'block' }} />
              <span style={{ fontSize:9, letterSpacing:'.42em', textTransform:'uppercase', color:'#f5f0e8' }}>Контакты</span>
            </div>
            <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(40px,5vw,68px)', fontWeight:300, color:'#f5f0e8', lineHeight:.92, marginBottom:40 }}>
              Начнём ваш<br /><em style={{ color:'#f5f0e8', fontStyle:'italic' }}>проект?</em>
            </h1>
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              {[
                { label:'Телефон', value:'+7 (800) 555-00-00' },
                { label:'Email',   value:'info@facade-studio.ru' },
                { label:'Часы',    value:'Пн–Пт, 10:00–19:00' },
                { label:'Адрес',   value:'Москва, ул. Дизайнеров, 12' },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize:8, letterSpacing:'.28em', textTransform:'uppercase', color:'rgba(245,240,232,.6)', marginBottom:4 }}>{item.label}</div>
                  <div style={{ fontSize:13, color:'rgba(245,240,232,.72)', letterSpacing:'.04em' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form side */}
        <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', padding:'80px 8vw' }}>

          {sent ? (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:64, color:'#f5f0e8', lineHeight:1, marginBottom:16 }}>✓</div>
              <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:40, fontWeight:300, color:'#f5f0e8', marginBottom:12 }}>Заявка отправлена</h2>
              <p style={{ fontSize:11, color:'rgba(245,240,232,.38)', lineHeight:1.8 }}>Наш менеджер свяжется с вами в течение 2 часов</p>
            </div>
          ) : (
            <>
              <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(36px,4vw,54px)', fontWeight:300, color:'#f5f0e8', marginBottom:8, lineHeight:.95 }}>
                Оставьте заявку
              </h2>
              <p style={{ fontSize:11, color:'rgba(245,240,232,.38)', lineHeight:1.8, marginBottom:48, maxWidth:380 }}>
                Расскажите о вашем проекте. Мы свяжемся в течение 2 часов и подберём оптимальное решение.
              </p>

              <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:28 }}>
                {[
                  { key:'name',    label:'Имя',            type:'text',  required:true  },
                  { key:'phone',   label:'Телефон',         type:'tel',   required:true  },
                  { key:'email',   label:'Email',           type:'email', required:false },
                  { key:'message', label:'Сообщение',       type:'area',  required:false },
                ].map(f => (
                  <div key={f.key} style={{ position:'relative' }}>
                    <div style={{ fontSize:8, letterSpacing:'.28em', textTransform:'uppercase', color:'rgba(245,240,232,.38)', marginBottom:8 }}>{f.label}{f.required&&<span style={{ color:'#f5f0e8' }}> *</span>}</div>
                    {f.type === 'area' ? (
                      <textarea
                        value={(form as any)[f.key]}
                        onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
                        rows={3}
                        placeholder="Расскажите о вашем проекте..."
                        style={{ ...inputStyle, resize:'none', paddingTop:12, fontSize:12 }}
                      />
                    ) : (
                      <input
                        type={f.type}
                        value={(form as any)[f.key]}
                        onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
                        required={f.required}
                        placeholder={f.label}
                        style={inputStyle}
                      />
                    )}
                    <div style={{ position:'absolute', bottom:0, left:0, width:'0%', height:1, background:'#f5f0e8', transition:'width .3s' }} />
                  </div>
                ))}

                <button type="submit" disabled={sending} style={{
                  background:'#c4907a', color:'#141210',
                  border:'none', padding:'16px', fontSize:9,
                  fontWeight:500, letterSpacing:'.24em', textTransform:'uppercase',
                  cursor:'none', marginTop:8,
                  opacity: sending ? .7 : 1, transition:'opacity .2s',
                }}>
                  {sending ? '...' : 'Отправить заявку'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

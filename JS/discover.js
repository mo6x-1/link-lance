document.addEventListener('DOMContentLoaded', function(){
  const list = document.getElementById('talentList');
  const modal = document.getElementById('talentModal');
  const modalContent = document.getElementById('talentModalContent');
  const closeBtn = document.getElementById('closeTalentModal');

  function defaultAvatarSvg(name, bg) {
    const initials = (name||'').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase() || 'U';
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><rect width='100%' height='100%' fill='${bg}'/><text x='50%' y='50%' dy='0.36em' font-family='Arial' font-size='56' fill='#fff' text-anchor='middle'>${initials}</text></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  const samples = {
    'alice@example.com': {
      name: 'Alice Kareem',
      bio: 'Full-stack developer specializing in React and Node. Built marketplaces and SaaS products.',
      portfolio: ['https://alice.dev', 'https://github.com/alicek'],
      avatar: defaultAvatarSvg('Alice Kareem','#3b5998')
    },
    'samir@example.com': {
      name: 'Samir El-Najjar',
      bio: 'Senior UI/UX designer with 8+ years designing apps and brand systems.',
      portfolio: ['https://dribbble.com/samir', 'https://behance.net/samir'],
      avatar: defaultAvatarSvg('Samir El-Najjar','#4CAF50')
    },
    'mona@example.com': {
      name: 'Mona Farouk',
      bio: 'Technical writer and translator; Arabic & English with SEO expertise.',
      portfolio: ['https://mona.blog', 'https://linkedin.com/in/mona'],
      avatar: defaultAvatarSvg('Mona Farouk','#FFC107')
    }
  };

  function loadProfiles(){
    const raw = localStorage.getItem('ll_profile') || '{}';
    let profiles = {};
    try { profiles = JSON.parse(raw || '{}'); } catch(e){ profiles = {}; }
    // merge samples if none exist
    Object.keys(samples).forEach(k => { if (!profiles[k]) profiles[k] = samples[k]; });
    localStorage.setItem('ll_profile', JSON.stringify(profiles));
    return profiles;
  }

  function renderCard(email, data){
    const card = document.createElement('article');
    card.className = 'talent-card';
    card.innerHTML = `
      <img class="talent-avatar" src="${data.avatar||''}" alt="${escapeHtml(data.name||'')}">
      <h3>${escapeHtml(data.name||'Unnamed')}</h3>
      <p class="talent-bio">${escapeHtml((data.bio||'').slice(0,120))}${(data.bio||'').length>120? '…': ''}</p>
      <div style="margin-top:8px"><button class="view-profile-btn" data-email="${encodeURIComponent(email)}">View profile</button></div>
    `;
    return card;
  }

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]); }

  function openModal(email, profile){
    modalContent.innerHTML = `
      <div class="talent-modal-header"><img src="${profile.avatar||''}" alt="avatar" class="talent-modal-avatar"><div><h2>${escapeHtml(profile.name||'')}</h2><p>${escapeHtml(profile.bio||'')}</p></div></div>
      <section class="talent-modal-portfolio"><h4>Portfolio</h4><div class="portfolio-grid">${(profile.portfolio||[]).map(u => `<div class="portfolio-item"><a href="${escapeHtml(u)}" target="_blank" rel="noopener noreferrer">${escapeHtml(u)}</a></div>`).join('')}</div></section>
    `;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
  }

  function closeModal(){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }

  // render list
  const profiles = loadProfiles();
  list.innerHTML = '';
  Object.keys(profiles).forEach(email => {
    const p = profiles[email];
    const card = renderCard(email,p);
    list.appendChild(card);
  });

  // delegate view clicks
  list.addEventListener('click', function(e){
    const btn = e.target.closest('.view-profile-btn');
    if (!btn) return;
    const email = decodeURIComponent(btn.dataset.email || '');
    const profiles = JSON.parse(localStorage.getItem('ll_profile')||'{}');
    const profile = profiles[email];
    if (profile) openModal(email, profile);
  });

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function(e){ if (e.target === modal) closeModal(); });

});

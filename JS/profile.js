document.addEventListener('DOMContentLoaded', function(){
  const auth = localStorage.getItem('ll_auth');
  if (!auth) {
    // if not logged in, redirect to login page
    window.location.href = 'log in sign up.html';
    return;
  }

  const email = auth.toLowerCase();
  const profiles = JSON.parse(localStorage.getItem('ll_profile') || '{}');
  const profile = profiles[email] || null;

  const container = document.getElementById('profile-root');

  function renderProfileView(data){
    container.innerHTML = `
      <section class="profile-header">
        <img src="${data.avatar || ''}" alt="Profile avatar" class="profile-avatar" onerror="this.style.display='none'">
        <div class="profile-info">
          <h1>${escapeHtml(data.name || '')}</h1>
          <div class="profile-actions"><button id="editProfileBtn"><i class="fas fa-edit"></i> Edit Profile</button></div>
        </div>
      </section>

      <div class="profile-sections">
        <main class="section-content">
          <section class="about-me">
            <h2><i class="fas fa-user-circle"></i> About Me</h2>
            <p>${escapeHtml(data.bio || '')}</p>
          </section>

          <section class="portfolio">
            <h2><i class="fas fa-rocket"></i> Portfolio</h2>
            <div class="portfolio-grid">
              ${ (data.portfolio || []).map(p => `<div class="portfolio-item"><a href="${escapeHtml(p)}" target="_blank" rel="noopener noreferrer">${escapeHtml(p)}</a></div>`).join('') }
            </div>
          </section>
        </main>
      </div>
    `;

    document.getElementById('editProfileBtn').addEventListener('click', function(){ renderForm(data); });
  }

  function renderForm(existing){
    const existingPortfolio = (existing && existing.portfolio) ? existing.portfolio : [];

    container.innerHTML = `
      <section class="profile-edit">
        <h2>Edit Your Profile</h2>
        <form id="profileForm">
          <div class="avatar-upload">
            <div class="avatar-preview"><img id="avatarPreview" src="${escapeHtml(existing?.avatar||'')}" alt="avatar preview"></div>
            <div class="avatar-actions">
              <label class="avatar-change">Choose image<input type="file" name="avatar" accept="image/*" style="display:none"></label>
              <button type="button" class="avatar-change" id="removeAvatarBtn">Remove</button>
            </div>
          </div>
          <label>Name<br><input name="name" type="text" value="${escapeHtml(existing?.name||'')}" required></label>
          <label>Bio<br><textarea name="bio">${escapeHtml(existing?.bio||'')}</textarea></label>
          <label>Portfolio links<br>
            <div id="portfolioLinks">
              ${ existingPortfolio.map((ln, idx) => `<div class="link-row"><input name="portfolio_link" type="url" value="${escapeHtml(ln)}" placeholder="https://example.com/project${idx+1}"><button type="button" class="remove-link">×</button></div>`).join('') }
            </div>
            <div style="margin-top:8px"><button type="button" id="addLinkBtn" class="avatar-change">Add link</button></div>
          </label>
          <div style="margin-top:12px"><button type="submit" class="submit-btn">Save Profile</button></div>
        </form>
      </section>
    `;

    const form = document.getElementById('profileForm');
    const fileInput = form.querySelector('input[name="avatar"]');
    const previewImg = document.getElementById('avatarPreview');
    const removeBtn = document.getElementById('removeAvatarBtn');
    const portfolioWrap = document.getElementById('portfolioLinks');
    const addLinkBtn = document.getElementById('addLinkBtn');

    function bindRemoveButtons(){
      Array.from(portfolioWrap.querySelectorAll('.remove-link')).forEach(btn => {
        btn.removeEventListener('click', onRemoveLink);
        btn.addEventListener('click', onRemoveLink);
      });
    }
    function onRemoveLink(e){
      const row = e.target.closest('.link-row');
      if (row) row.remove();
    }

    // add new empty link input
    function addLink(value){
      const div = document.createElement('div');
      div.className = 'link-row';
      div.innerHTML = `<input name="portfolio_link" type="url" value="${escapeHtml(value||'')}" placeholder="https://example.com/project"><button type="button" class="remove-link">×</button>`;
      portfolioWrap.appendChild(div);
      bindRemoveButtons();
    }

    // initial bindings
    bindRemoveButtons();
    addLinkBtn.addEventListener('click', function(){ addLink(''); });

    // preview selected file immediately
    if (fileInput) {
      fileInput.addEventListener('change', function(){
        const f = this.files[0];
        if (f) {
          const r = new FileReader();
          r.onload = function(evt){ previewImg.src = evt.target.result; };
          r.readAsDataURL(f);
        }
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', function(){ previewImg.src = ''; if (fileInput) fileInput.value = ''; });
    }

    form.addEventListener('submit', function(e){
      e.preventDefault();
      const fd = new FormData(form);
      const name = fd.get('name').trim();
      const bio = fd.get('bio').trim();
      // collect portfolio link inputs
      const linkInputs = Array.from(form.querySelectorAll('input[name="portfolio_link"]'));
      const portfolio = linkInputs.map(i=>i.value.trim()).filter(Boolean);
      const file = fd.get('avatar');

      function saveProfile(avatarData){
        const profiles = JSON.parse(localStorage.getItem('ll_profile') || '{}');
        profiles[email] = { name, bio, portfolio, avatar: avatarData };
        localStorage.setItem('ll_profile', JSON.stringify(profiles));
        // update navbar image
        try{ if (window.updateAuthNav) window.updateAuthNav(); }catch(e){}
        renderProfileView(profiles[email]);
      }

      // if user selected a file, read it; otherwise use current preview src or existing avatar
      if (file && file.size) {
        const reader = new FileReader();
        reader.onload = function(evt){ saveProfile(evt.target.result); };
        reader.readAsDataURL(file);
      } else {
        const previewSrc = previewImg?.src || '';
        const existingAvatar = (previewSrc && previewSrc.indexOf('data:') === 0) ? previewSrc : (existing?.avatar || '');
        saveProfile(existingAvatar);
      }
    });
  }

  function escapeHtml(str){
    return String(str||'').replace(/[&<>\"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]; });
  }

  if (profile) {
    renderProfileView(profile);
  } else {
    renderForm(null);
  }

});

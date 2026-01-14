// JS for Services page (services.html)
// Handles hero search, makes service cards clickable, and small UI polish

document.addEventListener('DOMContentLoaded', function(){
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');

  function doSearch() {
    if (!searchInput) return;
    const q = searchInput.value.trim();
    if (!q) { 
      // friendly inline behavior instead of alert
      searchInput.focus();
      return;
    }
    const encoded = encodeURIComponent(q);
    window.location.href = `jobs.html?query=${encoded}`;
  }

  if (searchButton) searchButton.addEventListener('click', doSearch);
  if (searchInput) searchInput.addEventListener('keydown', function(e){ if (e.key === 'Enter') doSearch(); });

  // Make entire .service-card clickable (clicks on internal links still work)
  document.querySelectorAll('.service-card').forEach(card => {
    const link = card.querySelector('a.cta');
    if (!link) return;
    // add pointer cursor
    card.style.cursor = 'pointer';
    card.addEventListener('click', function(e){
      // ignore clicks on buttons/links inside card
      if (e.target.closest('a') || e.target.closest('button')) return;
      window.location.href = link.getAttribute('href');
    });
    // small hover effect
    card.addEventListener('mouseenter', () => card.classList.add('hover'));
    card.addEventListener('mouseleave', () => card.classList.remove('hover'));
  });

  // Optional: highlight category if ?category=... present
  try{
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    if (category) {
      document.querySelectorAll('.service-card h3').forEach(h3 => {
        if (h3.textContent && h3.textContent.toLowerCase().includes(category)) {
          const card = h3.closest('.service-card');
          if (card) card.classList.add('matched');
        }
      });
    }
  }catch(e){}

});

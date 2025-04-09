export default function ResourceMarker(type: string, L: any) {
  // Type-specific icons and colors
  const resourceTypes: Record<string, { icon: string, color: string }> = {
    shelter: { icon: 'ri-home-heart-line', color: '#8E24AA' },
    food: { icon: 'ri-restaurant-line', color: '#43A047' },
    water: { icon: 'ri-drop-line', color: '#039BE5' },  // Changed back to blue
    wifi: { icon: 'ri-wifi-line', color: '#FFA000' },
    weather: { icon: 'ri-cloud-line', color: '#E53935' },
    restroom: { icon: 'ri-user-3-line', color: '#607D8B' },  // Updated icon to standard restroom sign
    health: { icon: 'ri-medicine-bottle-line', color: '#E53935' }
  };

  const typeInfo = resourceTypes[type] || resourceTypes.shelter;
  
  // Add Remix Icon CSS if not already added
  if (!document.getElementById('remix-icon-css')) {
    const link = document.createElement('link');
    link.id = 'remix-icon-css';
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css';
    document.head.appendChild(link);
  }
  
  // Create a div for the marker
  const markerHtml = `
    <div class="resource-marker" style="
      background-color: ${typeInfo.color};
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">
      <i class="${typeInfo.icon}"></i>
    </div>
  `;
  
  return L.divIcon({
    html: markerHtml,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
}

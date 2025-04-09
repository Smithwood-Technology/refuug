import { Resource } from "@shared/schema";

export default function ResourcePopup(resource: Resource): string {
  // Type-specific icons and colors
  const resourceTypes: Record<string, { icon: string, color: string }> = {
    shelter: { icon: 'ri-home-heart-line', color: '#8E24AA' },
    food: { icon: 'ri-restaurant-line', color: '#43A047' },
    water: { icon: 'ri-drop-line', color: '#039BE5' },
    wifi: { icon: 'ri-wifi-line', color: '#FFA000' },
    weather: { icon: 'ri-cloud-line', color: '#E53935' },
    restroom: { icon: 'ri-toilet-paper-line', color: '#607D8B' },
    health: { icon: 'ri-medicine-bottle-line', color: '#00ACC1' }
  };

  const typeInfo = resourceTypes[resource.type] || resourceTypes.shelter;
  const typeDisplay = resource.type.charAt(0).toUpperCase() + resource.type.slice(1);
  
  return `
    <div class="resource-popup">
      <div class="font-medium text-lg mb-1">${resource.name}</div>
      <div class="flex items-center mb-2">
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
             style="background-color: ${typeInfo.color}20; color: ${typeInfo.color}">
          <i class="${typeInfo.icon} mr-1"></i> ${typeDisplay}
        </span>
      </div>
      <div class="text-sm mb-1"><i class="ri-map-pin-line mr-1 text-gray-500"></i> ${resource.address}</div>
      <div class="text-sm mb-1"><i class="ri-time-line mr-1 text-gray-500"></i> ${resource.hours || 'Hours not specified'}</div>
      ${resource.notes ? `<div class="text-sm mt-2 pt-2 border-t border-gray-200"><i class="ri-information-line mr-1 text-gray-500"></i> ${resource.notes}</div>` : ''}
    </div>
  `;
}

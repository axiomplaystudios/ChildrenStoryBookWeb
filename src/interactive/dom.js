export function node(tag, className = '', text) {
  const value = document.createElement(tag);
  value.className = className;
  if (text !== undefined) value.textContent = text;
  return value;
}
export function button(label, handler, className = 'quiet-button') {
  const value = node('button', className, label);
  value.type = 'button';
  value.addEventListener('click', handler);
  return value;
}
export function picture(control, resolveAsset) {
  const image = node('img');
  image.src = resolveAsset(control.image);
  image.alt = '';
  image.draggable = false;
  return image;
}

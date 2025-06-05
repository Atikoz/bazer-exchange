export function parseAction(data: string) {
  const [action, ...params] = data.split('_');
  console.log(action, params);
  return { action, params };
}
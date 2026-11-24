export type Product = { id: string; name: string; category: string; specs: string; price: number; stock: number; description: string; image: string };
export const CATEGORIES = ['ทั้งหมด', 'คอมเซ็ต', 'CPU', 'การ์ดจอ', 'RAM', 'จอคอม', 'อุปกรณ์เสริม'];
export function toProduct(value: Record<string, unknown>, index = 0): Product {
  return { id: String(value.id ?? value.ID ?? `product-${index}`), name: String(value.name ?? value.Name ?? ''), category: String(value.category ?? value.Category ?? 'อุปกรณ์เสริม'), specs: String(value.specs ?? value.Specs ?? ''), price: Number(value.price ?? value.Price ?? 0), stock: Number(value.stock ?? value.Stock ?? 0), description: String(value.description ?? value.Description ?? ''), image: String(value.image ?? value.Image ?? '') };
}

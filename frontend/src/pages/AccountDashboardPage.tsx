import {
  Check,
  ChevronRight,
  Edit3,
  FileText,
  ImagePlus,
  MapPin,
  Plus,
  Save,
  ShoppingBag,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/apiClient";
import RatingStars from "../components/common/RatingStars";

type Role = "buyer" | "farmer";

type Profile = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  municipality: string;
  district: string;
  province: string;
  farm_name?: string;
  description?: string;
  farm_image?: string | null;
  delivery_instructions?: string;
  verification_status?: string;
  verification_document?: string;
  profile_picture?: string | null;
};

type FarmProduct = {
  id: number;
  name: string;
  category: string;
  pricePerKg: number;
  bulkPrice: number;
  bulkMinimumQuantity: number;
  price: number;
  rating: number;
  unit: string;
  stock: number;
  status: "Published" | "Draft";
  image?: string;
  description?: string;
};

const startingProducts: FarmProduct[] = [
  { id: 1, name: "Organic Tomatoes", category: "Vegetables", pricePerKg: 120, bulkPrice: 108, bulkMinimumQuantity: 10, price: 120, rating: 4.8, unit: "kg", stock: 42, status: "Published" },
  { id: 2, name: "Fresh Spinach", category: "Leafy Greens", pricePerKg: 80, bulkPrice: 72, bulkMinimumQuantity: 10, price: 80, rating: 4.6, unit: "kg", stock: 28, status: "Published" },
];

export default function AccountDashboardPage({ role }: { role: Role }) {
  const isFarmer = role === "farmer";
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [products, setProducts] = useState(startingProducts);
  const [editingProduct, setEditingProduct] = useState<FarmProduct | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.all([
      apiClient.get("/auth/me/"),
      apiClient.get(`/profiles/${role}/`),
    ])
      .then(([userResponse, profileResponse]) => {
        if (!active) return;
        setProfile({ ...profileResponse.data, ...userResponse.data });
      })
      .catch(() => {
        if (active) setProfileError("We could not load your profile details.");
      })
      .finally(() => {
        if (active) setLoadingProfile(false);
      });

    return () => {
      active = false;
    };
  }, [role]);

  const updateProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const profileData = new FormData();
      ["farm_name", "address", "municipality", "district", "province", "description", "delivery_instructions"].forEach((field) => {
        const value = form.get(field);
        if (value !== null) profileData.append(field, String(value));
      });
      const verificationDocument = form.get("verification_document");
      if (verificationDocument instanceof File && verificationDocument.size > 0) {
        profileData.append("verification_document", verificationDocument);
      }
      const farmImage = form.get("farm_image");
      if (farmImage instanceof File && farmImage.size > 0) {
        profileData.append("farm_image", farmImage);
      }
      const profileResponse = await apiClient.patch(`/profiles/${role}/`, profileData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const userData = new FormData();
      userData.append("name", String(form.get("name")));
      userData.append("phone", String(form.get("phone")));
      const profilePicture = form.get("profile_picture");
      if (profilePicture instanceof File && profilePicture.size > 0) {
        userData.append("profile_picture", profilePicture);
      }
      const userResponse = await apiClient.patch("/auth/me/", userData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile((current) => current ? { ...current, ...profileResponse.data, ...userResponse.data } : current);
      setEditingProfile(false);
      setProfileError("");
    } catch {
      setProfileError("Your profile could not be saved. Please try again.");
    }
  };

  const saveProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const product: FarmProduct = {
      id: editingProduct?.id ?? Date.now(),
      name: String(form.get("name")),
      category: String(form.get("category")),
      pricePerKg: Number(form.get("pricePerKg") || form.get("price")),
      bulkPrice: Number(form.get("bulkPrice") || form.get("price")),
      bulkMinimumQuantity: Number(form.get("bulkMinimumQuantity") || 1),
      price: Number(form.get("pricePerKg") || form.get("price")),
      rating: Number(form.get("rating") || 0),
      unit: String(form.get("unit") || "kg"),
      stock: Number(form.get("stock")),
      status: form.get("status") as FarmProduct["status"],
      image: form.get("image") instanceof File && (form.get("image") as File).size > 0
        ? URL.createObjectURL(form.get("image") as File)
        : editingProduct?.image,
      description: String(form.get("description") || ""),
    };
    setProducts((items) => editingProduct ? items.map((item) => item.id === product.id ? product : item) : [product, ...items]);
    setEditingProduct(null);
    setShowProductForm(false);
  };

  return (
    <main className="min-h-[calc(100dvh-4.75rem)] bg-cream">
      <div className="mx-auto w-[calc(100%-2rem)] max-w-295 py-7 sm:w-[calc(100%-3rem)] sm:py-10">
        <header className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-harvest-500">{isFarmer ? "Farmer workspace" : "Buyer workspace"}</p>
            <h1 className="mt-1 font-display text-3xl font-semibold text-ink sm:text-4xl">{isFarmer ? "Manage your farm." : "Your marketplace account."}</h1>
            <p className="mt-2 text-sm text-muted">{isFarmer ? "Keep your farm details and products ready for local customers." : "Update your details and keep track of every order."}</p>
          </div>
          <Link to={isFarmer ? "/farmers" : "/marketplace"} className="inline-flex items-center gap-2 self-start rounded-xl bg-forest-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-forest-800 sm:self-auto">{isFarmer ? "View marketplace" : "Shop fresh produce"}<ChevronRight size={15} /></Link>
        </header>

        <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="space-y-5">
            <section className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                {profile?.profile_picture ? <img src={profile.profile_picture} alt="Profile" className="size-14 rounded-2xl object-cover" /> : <div className="grid size-14 place-items-center rounded-2xl bg-forest-50 text-forest-700"><UserRound size={24} /></div>}
                <div className="min-w-0"><h2 className="truncate text-lg font-extrabold text-ink">{profile?.name ?? "Your profile"}</h2><p className="text-xs font-semibold text-muted">{isFarmer ? "Farmer account" : "Buyer account"}</p></div>
              </div>
              <div className="mt-5 space-y-3 border-t border-stone-100 pt-5 text-xs"><div className="flex items-center gap-2 text-stone-600"><MapPin size={15} className="text-forest-700" />{[profile?.municipality, profile?.district, profile?.province].filter(Boolean).join(", ") || "Add your location"}</div><div className="flex items-center gap-2 text-stone-600"><span className="grid size-4 place-items-center rounded-full bg-forest-50 text-forest-700"><Check size={10} /></span>{profile?.email ?? "Loading account"}</div></div>
              <button type="button" disabled={!profile} onClick={() => setEditingProfile(true)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-forest-200 bg-forest-50 px-4 py-2.5 text-xs font-extrabold text-forest-700 transition hover:bg-forest-100 disabled:cursor-not-allowed disabled:opacity-50"><Edit3 size={14} />{loadingProfile ? "Loading profile" : "Edit my details"}</button>
            </section>

            {profileError && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{profileError}</p>}

            <section className="rounded-3xl bg-forest-700 p-5 text-white shadow-[0_14px_35px_rgba(45,90,39,0.18)] sm:p-6">{isFarmer && profile?.farm_image && <img src={profile.farm_image} alt={profile.farm_name ?? "Farm"} className="mb-4 h-32 w-full rounded-2xl object-cover" />}<p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-harvest-300">{isFarmer ? "Farm status" : "Account snapshot"}</p><p className="mt-2 text-2xl font-extrabold">{isFarmer ? "Selling ready" : "12 orders"}</p><p className="mt-1 text-xs leading-5 text-white/70">{isFarmer ? "Your profile is visible to the Koshi Bazaar community." : "Fresh food from local farms, all in one place."}</p></section>
          </aside>

          <section className="space-y-5">
            {editingProfile && profile && <ProfileForm profile={profile} isFarmer={isFarmer} onCancel={() => setEditingProfile(false)} onSave={updateProfile} />}

            {isFarmer ? (
              <FarmerProducts products={products} onAdd={() => { setEditingProduct(null); setShowProductForm(true); }} onEdit={(product) => { setEditingProduct(product); setShowProductForm(true); }} onDelete={(id) => setProducts((items) => items.filter((item) => item.id !== id))} />
            ) : (
              <BuyerOrders />
            )}

            {isFarmer && showProductForm && <ProductForm product={editingProduct} onCancel={() => { setShowProductForm(false); setEditingProduct(null); }} onSave={saveProduct} />}
          </section>
        </div>
      </div>
    </main>
  );
}

function ProfileForm({ profile, isFarmer, onCancel, onSave }: { profile: Profile; isFarmer: boolean; onCancel: () => void; onSave: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form onSubmit={onSave} encType="multipart/form-data" className="rounded-3xl border border-forest-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-harvest-500">Profile details</p><h2 className="mt-1 text-lg font-extrabold text-ink">Edit your profile</h2></div><button type="button" onClick={onCancel} aria-label="Close" className="grid size-8 place-items-center rounded-lg text-stone-400 hover:bg-stone-100"><X size={16} /></button></div><div className="grid gap-4 sm:grid-cols-2"><FileField label="Profile picture" name="profile_picture" accept="image/*" /><Field label="Full name" name="name" defaultValue={profile.name} /><Field label="Phone" name="phone" defaultValue={profile.phone ?? ""} required={false} />{isFarmer && <><Field label="Farm name" name="farm_name" defaultValue={profile.farm_name ?? ""} /><FileField label="Farm image" name="farm_image" accept="image/*" /></>}<Field label="Address" name="address" defaultValue={profile.address} /><Field label="Municipality" name="municipality" defaultValue={profile.municipality} required={false} /><Field label="District" name="district" defaultValue={profile.district} required={false} /><Field label="Province" name="province" defaultValue={profile.province} />{isFarmer && <FileField label="Verification document" name="verification_document" accept=".pdf,.jpg,.jpeg,.png" />}{isFarmer ? <TextAreaField label="Farm description" name="description" defaultValue={profile.description ?? ""} /> : <TextAreaField label="Delivery instructions" name="delivery_instructions" defaultValue={profile.delivery_instructions ?? ""} />}</div>{isFarmer && profile.farm_image && <a href={profile.farm_image} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-forest-700 hover:underline"><ImagePlus size={15} />View current farm image</a>}{isFarmer && profile.verification_document && <a href={profile.verification_document} target="_blank" rel="noreferrer" className="ml-4 mt-4 inline-flex items-center gap-2 text-xs font-bold text-forest-700 hover:underline"><FileText size={15} />View current verification document</a>}<button type="submit" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-forest-700 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-forest-800"><Save size={14} />Save profile</button></form>;
}

function Field({ label, name, defaultValue, type = "text", required = true }: { label: string; name: string; defaultValue: string; type?: string; required?: boolean }) { return <><label><span className="mb-1.5 block text-[10px] font-bold text-stone-600">{label}</span><input required={required} name={name} type={type} defaultValue={defaultValue} min={name === "rating" ? 0 : undefined} max={name === "rating" ? 5 : undefined} step={name === "rating" ? 0.1 : undefined} className="w-full rounded-xl border border-stone-200 bg-cream px-3 py-2.5 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/10" /></label>{name === "stock" && <label><span className="mb-1.5 block text-[10px] font-bold text-stone-600">Rating (0-5)</span><input name="rating" type="number" min="0" max="5" step="0.1" defaultValue="0" className="w-full rounded-xl border border-stone-200 bg-cream px-3 py-2.5 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/10" /></label>}</>; }

function TextAreaField({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) { return <label className="sm:col-span-2"><span className="mb-1.5 block text-[10px] font-bold text-stone-600">{label}</span><textarea name={name} defaultValue={defaultValue} rows={3} className="w-full resize-y rounded-xl border border-stone-200 bg-cream px-3 py-2.5 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/10" /></label>; }

function FileField({ label, name, accept }: { label: string; name: string; accept: string }) { return <label className="sm:col-span-2"><span className="mb-1.5 block text-[10px] font-bold text-stone-600">{label}</span><span className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-stone-300 bg-cream px-3 py-3 text-xs font-semibold text-muted hover:border-forest-500"><ImagePlus size={16} className="text-forest-700" /><input name={name} type="file" accept={accept} className="min-w-0 flex-1 text-xs" /></span></label>; }

function BuyerOrders() { const orders = [{ id: "KB-1048", farm: "Hari Organic Farm", amount: "Rs. 860", status: "Delivered" }, { id: "KB-1057", farm: "Koshi Green Farm", amount: "Rs. 520", status: "On the way" }, { id: "KB-1063", farm: "Green Valley Farm", amount: "Rs. 1,240", status: "Processing" }]; return <section className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-harvest-500">Buyer activity</p><h2 className="mt-1 text-lg font-extrabold text-ink">Recent orders</h2></div><Link to="/orders" className="text-xs font-extrabold text-forest-700 hover:underline">View all</Link></div><div className="mt-5 space-y-3">{orders.map((order) => <div key={order.id} className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-cream p-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-forest-700 shadow-sm"><ShoppingBag size={17} /></span><div className="min-w-0 flex-1"><p className="text-xs font-extrabold text-ink">{order.id}</p><p className="mt-0.5 truncate text-[10px] text-muted">{order.farm}</p></div><div className="text-right"><p className="text-xs font-extrabold text-ink">{order.amount}</p><span className="text-[10px] font-bold text-forest-700">{order.status}</span></div></div>)}</div></section>; }

function FarmerProducts({ products, onAdd, onEdit, onDelete }: { products: FarmProduct[]; onAdd: () => void; onEdit: (product: FarmProduct) => void; onDelete: (id: number) => void }) { return <section className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-harvest-500">Farmer catalogue</p><h2 className="mt-1 text-lg font-extrabold text-ink">Your products</h2></div><button type="button" onClick={onAdd} className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-700 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-forest-800"><Plus size={15} />Add product</button></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-160 text-left"><thead><tr className="border-b border-stone-100 text-[10px] font-extrabold uppercase tracking-wider text-muted"><th className="pb-3">Product</th><th className="pb-3">Rating</th><th className="pb-3">Price</th><th className="pb-3">Stock</th><th className="pb-3">Status</th><th className="pb-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-stone-100">{products.map((product) => <tr key={product.id} className="text-xs"><td className="py-4"><p className="font-extrabold text-ink">{product.name}</p><p className="mt-0.5 text-[10px] text-muted">{product.category} / {product.unit}</p></td><td className="py-4"><RatingStars rating={product.rating} size={12} /></td><td className="py-4 font-bold text-ink">Rs. {product.price}</td><td className={`py-4 font-bold ${product.stock === 0 ? "text-red-500" : "text-forest-700"}`}>{product.stock}</td><td className="py-4"><span className="rounded-full bg-forest-50 px-2.5 py-1 text-[10px] font-bold text-forest-700">{product.status}</span></td><td className="py-4"><div className="flex justify-end gap-1"><button type="button" onClick={() => onEdit(product)} aria-label={`Edit ${product.name}`} className="grid size-8 place-items-center rounded-lg text-stone-400 hover:bg-forest-50 hover:text-forest-700"><Edit3 size={14} /></button><button type="button" onClick={() => onDelete(product.id)} aria-label={`Delete ${product.name}`} className="grid size-8 place-items-center rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={14} /></button></div></td></tr>)}</tbody></table></div></section>; }

function ProductForm({ product, onCancel, onSave }: { product: FarmProduct | null; onCancel: () => void; onSave: (event: FormEvent<HTMLFormElement>) => void }) {
  const value = (key: keyof FarmProduct) => product ? String(product[key] ?? "") : "";
  return <form onSubmit={onSave} className="rounded-3xl border border-forest-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-harvest-500">Product listing</p><h2 className="mt-1 text-lg font-extrabold text-ink">{product ? "Edit product" : "Add a product"}</h2></div><button type="button" onClick={onCancel} aria-label="Close" className="grid size-8 place-items-center rounded-lg text-stone-400 hover:bg-stone-100"><X size={16} /></button></div><div className="grid gap-4 sm:grid-cols-2"><FileField label="Product image" name="image" accept="image/*" /><Field label="Product name" name="name" defaultValue={value("name")} /><Field label="Category" name="category" defaultValue={value("category")} /><Field label="Regular price" name="price" type="number" defaultValue={value("price")} /><Field label="Price per kg" name="pricePerKg" type="number" defaultValue={value("pricePerKg")} /><div className="sm:col-span-2 rounded-2xl border border-forest-100 bg-forest-50/60 p-4"><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-forest-700">Bulk pricing</p><p className="mt-1 text-xs text-muted">Offer a lower unit price when customers buy the minimum quantity.</p><div className="mt-3 grid gap-4 sm:grid-cols-2"><Field label="Bulk price per unit" name="bulkPrice" type="number" defaultValue={value("bulkPrice")} /><Field label="Minimum bulk quantity" name="bulkMinimumQuantity" type="number" defaultValue={value("bulkMinimumQuantity") || "10"} /></div></div><Field label="Unit" name="unit" defaultValue={value("unit")} /><Field label="Stock quantity" name="stock" type="number" defaultValue={value("stock")} /><label><span className="mb-1.5 block text-[10px] font-bold text-stone-600">Status</span><select name="status" defaultValue={value("status") || "Published"} className="w-full rounded-xl border border-stone-200 bg-cream px-3 py-2.5 text-sm outline-none focus:border-forest-700"><option>Published</option><option>Draft</option></select></label><TextAreaField label="Description" name="description" defaultValue={value("description")} /></div>{product?.image && <img src={product.image} alt={product.name} className="mt-4 h-28 w-28 rounded-xl object-cover" />}<div className="mt-5 flex gap-2"><button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-forest-700 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-forest-800"><Save size={14} />Save product</button><button type="button" onClick={onCancel} className="rounded-xl px-4 py-2.5 text-xs font-bold text-stone-500 hover:bg-stone-100">Cancel</button></div></form>;
}

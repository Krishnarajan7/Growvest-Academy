import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ImageOff,
  PackageOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { adminApi } from "@/lib/axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const THEME_OPTIONS = ["green", "blue", "purple", "orange", "red"];

const EMPTY_FORM = {
  name: "",
  price: "",
  original_price: "",
  best_for: "",
  badge: "",
  theme: "blue",
  description: "",
  featuresText: "",
  in_stock: true,
  is_active: true,
};

const formatPrice = (p) =>
  `₹${Number(p || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getProducts();
      setProducts(res?.data || []);
    } catch (e) {
      toast.error(e?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    setDialogOpen(true);
  };

  const openEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      price: product.price ?? "",
      original_price: product.original_price ?? "",
      best_for: product.best_for || "",
      badge: product.badge || "",
      theme: product.theme || "blue",
      description: product.description || "",
      featuresText: (product.features || []).join("\n"),
      in_stock: !!product.in_stock,
      is_active: !!product.is_active,
    });
    setImageFile(null);
    setImagePreview(product.image_url || null);
    setDialogOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    if (form.price === "" || isNaN(Number(form.price)))
      return toast.error("Valid price is required");

    const features = form.featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      best_for: form.best_for,
      badge: form.badge,
      theme: form.theme,
      description: form.description,
      features,
      in_stock: form.in_stock,
      is_active: form.is_active,
    };
    if (form.original_price !== "" && !isNaN(Number(form.original_price))) {
      payload.original_price = Number(form.original_price);
    }
    if (imageFile) payload.image = imageFile;

    try {
      setSaving(true);
      if (editingId) {
        await adminApi.updateProduct(editingId, payload);
        toast.success("Product updated");
      } else {
        await adminApi.createProduct(payload);
        toast.success("Product created");
      }
      setDialogOpen(false);
      loadProducts();
    } catch (err) {
      const firstError =
        err?.errors && Object.values(err.errors)?.[0]?.[0];
      toast.error(firstError || err?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.deleteProduct(deleteTarget.id);
      toast.success("Product deleted");
      setDeleteTarget(null);
      loadProducts();
    } catch (e) {
      toast.error(e?.message || "Failed to delete product");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">School Kit Store</h1>
          <p className="text-sm text-muted-foreground">
            Manage the products shown on the public Store page.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <PackageOpen className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-medium">No products yet</p>
          <p className="text-sm text-muted-foreground">
            Click “Add Product” to create your first school kit.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex flex-col overflow-hidden rounded-xl border bg-card"
            >
              <div className="flex h-40 items-center justify-center bg-muted">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageOff className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{p.name}</h3>
                  <span className="font-bold text-primary">
                    {formatPrice(p.price)}
                  </span>
                </div>
                {p.best_for && (
                  <p className="text-sm text-muted-foreground">
                    Best for {p.best_for}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant={p.is_active ? "default" : "secondary"}>
                    {p.is_active ? "Active" : "Hidden"}
                  </Badge>
                  {!p.in_stock && (
                    <Badge variant="destructive">Out of stock</Badge>
                  )}
                  <Badge variant="outline">
                    {(p.features || []).length} items
                  </Badge>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openEdit(p)}
                  >
                    <Pencil className="mr-1.5 h-4 w-4" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(p)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Product" : "Add Product"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Basic Kit"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="199"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="original_price">Original Price (₹)</Label>
                <Input
                  id="original_price"
                  type="number"
                  min="0"
                  value={form.original_price}
                  onChange={(e) =>
                    setForm({ ...form, original_price: e.target.value })
                  }
                  placeholder="optional"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="best_for">Best For</Label>
                <Input
                  id="best_for"
                  value={form.best_for}
                  onChange={(e) =>
                    setForm({ ...form, best_for: e.target.value })
                  }
                  placeholder="LKG - 2nd STD"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="theme">Card Colour</Label>
                <select
                  id="theme"
                  value={form.theme}
                  onChange={(e) => setForm({ ...form, theme: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm capitalize"
                >
                  {THEME_OPTIONS.map((t) => (
                    <option key={t} value={t} className="capitalize">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="badge">Badge</Label>
              <Input
                id="badge"
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="e.g. MOST POPULAR"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Short description of the kit"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="features">Included Items (one per line)</Label>
              <Textarea
                id="features"
                rows={5}
                value={form.featuresText}
                onChange={(e) =>
                  setForm({ ...form, featuresText: e.target.value })
                }
                placeholder={"2 Notebooks\n2 Pencils\n1 Pen"}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="image">Product Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="mt-2 h-28 w-full rounded-md object-cover"
                />
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="in_stock" className="cursor-pointer">
                In Stock
              </Label>
              <Switch
                id="in_stock"
                checked={form.in_stock}
                onCheckedChange={(v) => setForm({ ...form, in_stock: v })}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="is_active" className="cursor-pointer">
                Visible on Store
              </Label>
              <Switch
                id="is_active"
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? "Save Changes" : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove “{deleteTarget?.name}” from the store.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

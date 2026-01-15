import { useState, useMemo, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Upload,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Video,
  Eye,
  Calendar,
  X,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function AdminMedia() {
  const [media, setMedia] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    file: null,
  });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const normalizeMedia = (m) => {
    if (!m || typeof m !== "object") {
      console.warn("Invalid media item received:", m);
      return null;
    }

    return {
      id: m.id ?? null,
      title: m.name ?? "Untitled",
      type: m.type ?? "unknown",
      category: m.categories?.[0]?.name ?? "General",
      categorySlug: m.categories?.[0]?.slug ?? "general",
      url: m.url ?? "",
      thumbnailUrl: m.thumbnail_url ?? m.url ?? "",
      uploadedDate: m.created_at
        ? new Date(m.created_at).toLocaleDateString()
        : "",
      views: m.view_count ?? 0,
    };
  };

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await api.get("/admin/media");

        // More defensive data extraction
        let items = [];

        if (res?.data?.data?.data) {
          items = res.data.data.data; // most nested case
        } else if (res?.data?.data) {
          items = res.data.data;
        } else if (Array.isArray(res?.data)) {
          items = res.data;
        }

        const validItems = items
          .filter(Boolean)
          .map(normalizeMedia)
          .filter((item) => item !== null && item.id !== null);

        setMedia(validItems);
      } catch (err) {
        console.error("Failed to load media:", err);
        toast.error("Failed to load media library");
        setMedia([]);
      }
    };

    fetchMedia();
  }, []);

  const categories = useMemo(() => {
    const cats = new Map();

    media.forEach((m) => {
      if (m?.categorySlug && m.categorySlug !== "general") {
        cats.set(m.categorySlug, m.category);
      }
    });

    return [
      { slug: "all", name: "All Categories" },
      ...Array.from(cats, ([slug, name]) => ({ slug, name })),
    ];
  }, [media]);

  const filteredMedia = useMemo(() => {
    return media.filter((item) => {
      if (!item) return false;

      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(searchLower) ||
        (item.category ?? "").toLowerCase().includes(searchLower);

      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesCategory =
        categoryFilter === "all" || item.categorySlug === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [media, searchQuery, typeFilter, categoryFilter]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      file: null,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const createFormData = () => {
    const data = new FormData();
    if (formData.file) {
      data.append("files[]", formData.file);
    }
    data.append("title", formData.title);
    data.append("category", formData.category);
    data.append("description", formData.description || "");
    data.append("visibility", "public");
    return data;
  };

  const handleAddMedia = async () => {
    if (!formData.title.trim() || !formData.file) {
      toast.error("Title and file are required");
      return;
    }

    try {
      const res = await api.post("/admin/media/upload", createFormData());

      let uploadedItems = [];
      if (res?.data?.data?.[0]) {
        uploadedItems = [res.data.data[0]];
      } else if (Array.isArray(res?.data?.data)) {
        uploadedItems = res.data.data;
      }

      const newItems = uploadedItems
        .map(normalizeMedia)
        .filter((item) => item && item.id);

      if (newItems.length > 0) {
        setMedia((prev) => [...newItems, ...prev]);
        toast.success("Media uploaded successfully!");
      }

      resetForm();
      setIsAddOpen(false);
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload media");
    }
  };

  const handleEditMedia = async () => {
    if (!selectedMedia?.id) return;

    try {
      const payload = {
        name: formData.title.trim(),
        category: formData.category.trim(),
        description: formData.description.trim(),
      };

      const res = await api.put(`/admin/media/${selectedMedia.id}`, payload);

      const updatedItem = normalizeMedia(res?.data?.data ?? res?.data);

      if (updatedItem && updatedItem.id) {
        setMedia((prev) =>
          prev.map((m) => (m.id === updatedItem.id ? updatedItem : m))
        );
        toast.success("Media updated successfully");
      }

      setIsEditOpen(false);
      setSelectedMedia(null);
      resetForm();
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update media");
    }
  };

  const handleDeleteMedia = async () => {
    if (!selectedMedia?.id) return;

    try {
      await api.delete(`/admin/media/${selectedMedia.id}`);
      setMedia((prev) => prev.filter((m) => m.id !== selectedMedia.id));
      toast.success("Media deleted successfully");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete media");
    } finally {
      setIsDeleteOpen(false);
      setSelectedMedia(null);
    }
  };

  const openEditDialog = (item) => {
    if (!item) return;
    setSelectedMedia(item);
    setFormData({
      title: item.title || "",
      description: "",
      category: item.category || "",
      file: null,
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (item) => {
    if (!item) return;
    setSelectedMedia(item);
    setIsDeleteOpen(true);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    const fileType = file.type.startsWith("video/") ? "video" : "image";
    setFormData((prev) => ({ ...prev, file, type: fileType }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 xl:p-10 2xl:p-12 mx-auto w-full max-w-screen-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage your photos & videos
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Upload className="mr-2 h-4 w-4" />
              Upload New
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload New Media</DialogTitle>
              <DialogDescription>
                Drag & drop or click to upload image/video
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="My awesome event photo"
                />
              </div>

              <div className="grid gap-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of this media..."
                />
              </div>

              <div className="grid gap-2">
                <Label>Media File *</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/30 hover:border-primary/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,video/mp4"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />
                  {formData.file ? (
                    <div className="space-y-2">
                      <p className="font-medium">{formData.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData((p) => ({ ...p, file: null }))}
                      >
                        <X className="h-3.5 w-3.5 mr-1.5" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        Click to browse or drag & drop here
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supports: PNG, JPG, JPEG, MP4 (max 50MB recommended)
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Select File
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Events, Workshops, Team..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsAddOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleAddMedia} disabled={!formData.file || !formData.title.trim()}>
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.slug} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredMedia.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg font-medium text-muted-foreground">No media found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try changing filters or upload something new
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:gap-7 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredMedia.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden group hover:shadow-xl transition-all duration-300 border flex flex-col min-h-[420px] sm:min-h-[460px]"
            >
              <div className="relative aspect-[4/3] sm:aspect-video bg-muted/60">
                {item.type === "video" ? (
                  <video
                    src={item.url}
                    className="h-full w-full object-cover"
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1568667256549-094345857637?w=800&q=60&text=Image+Error";
                    }}
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 gap-3">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-10 w-10 shadow-md"
                    onClick={() => openEditDialog(item)}
                  >
                    <Pencil className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-10 w-10 shadow-md"
                    onClick={() => openDeleteDialog(item)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>

                <Badge
                  className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium"
                  variant="secondary"
                >
                  {item.type === "video" ? <Video className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                  {item.type}
                </Badge>
              </div>

              <CardContent className="p-5 flex flex-col flex-grow">
                <h3 className="font-semibold line-clamp-2 text-lg leading-tight mb-3">
                  {item.title}
                </h3>

                <div className="mt-auto flex flex-wrap justify-between items-center text-sm text-muted-foreground gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {item.uploadedDate}
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    {item.views?.toLocaleString() ?? "0"}
                  </div>
                </div>

                {item.category && item.category !== "General" && (
                  <Badge
                    variant="outline"
                    className="mt-4 self-start text-xs sm:text-sm px-3 py-1"
                  >
                    {item.category}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Media</DialogTitle>
            <DialogDescription>Update media information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditMedia}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Media</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>"{selectedMedia?.title}"</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMedia}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
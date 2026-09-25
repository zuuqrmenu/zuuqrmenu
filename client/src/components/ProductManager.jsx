import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { menuService } from '../services/menuService';
import { suggestProductDetails } from '../services/aiService';
import { compressImageToWebp } from '../utils/imageOptimizer';
import '../components/CategorySuggester.css';
import {
  getFilteredProductSuggestions,
  generateProductDescriptionText,
  COMMON_INGREDIENTS,
  COMMON_ALLERGENS,
  filterSuggestionsList,
} from '../data/productTemplates';

const DIETARY_GROUPS = [
  {
    title: 'Beslenme Tercihleri',
    options: [
      { value: 'VEGAN', label: 'Vegan' },
      { value: 'VEGETARIAN', label: 'Vejetaryen' },
      { value: 'GLUTEN_FREE', label: 'Glutensiz' },
      { value: 'HALAL', label: 'Helal' },
    ],
  },
  {
    title: 'Lezzet & Tercih',
    options: [
      { value: 'SPICY', label: 'Acılı' },
      { value: 'MILD', label: 'Acısız' },
    ],
  },
];

const IconSparkle = ({ size = 14, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 1L14.8 8.8L22 12L14.8 15.2L12 23L9.2 15.2L2 12L9.2 8.8L12 1Z" />
  </svg>
);

/**
 * Interactive Tag / Chip Input Component for Ingredients & Allergens
 */
const TagInput = ({ tags = [], onChange, placeholder, suggestionsList = [] }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const filteredSuggestions = useMemo(() => {
    return filterSuggestionsList(suggestionsList, inputValue, tags);
  }, [suggestionsList, inputValue, tags]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (text) => {
    const clean = text.trim().replace(/^#/, '');
    if (!clean) return;
    const exists = tags.some((t) => t.toLowerCase() === clean.toLowerCase());
    if (!exists) {
      onChange([...tags, clean]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div
      ref={containerRef}
      className="tag-input-container"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, idx) => (
        <span key={`${tag}-${idx}`} className="tag-chip">
          <span>{tag}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(idx);
            }}
            className="tag-chip__remove"
            aria-label={`${tag} kaldır`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : 'Yeni ekle...'}
        className="tag-input-field"
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="tag-autocomplete-dropdown">
          {filteredSuggestions.map((item) => (
            <button
              key={item}
              type="button"
              className="tag-autocomplete-item"
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(item);
              }}
            >
              <span className="text-slate-400 font-bold text-xs">+</span>
              <span className="font-medium text-xs">{item}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Modern On/Off Switch for Availability & Featured Showcase
 */
const StatusSwitches = ({ form, setForm }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
    {/* On/Off Switch: Mevcut (Satışta) */}
    <div
      role="switch"
      aria-checked={form.isAvailable}
      tabIndex={0}
      onClick={() => setForm((c) => ({ ...c, isAvailable: !c.isAvailable }))}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          setForm((c) => ({ ...c, isAvailable: !c.isAvailable }));
        }
      }}
      className={`modern-toggle-card ${form.isAvailable ? 'is-active-available' : ''}`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
            form.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
          }`}
        >
          {form.isAvailable ? '✓' : '✕'}
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-900 leading-tight">
            {form.isAvailable ? 'Mevcut (Satışta)' : 'Tükendi (Kapalı)'}
          </p>
          <p className="text-[10px] text-slate-500">
            {form.isAvailable ? 'Menüde siparişe açık' : 'Geçici olarak satış dışı'}
          </p>
        </div>
      </div>
      <div className={`modern-switch-track ${form.isAvailable ? 'is-on' : ''}`}>
        <div className="modern-switch-thumb" />
      </div>
    </div>

    {/* Modern Card Switch: Öne Çıkan Ürün */}
    <div
      role="switch"
      aria-checked={form.isFeatured}
      tabIndex={0}
      onClick={() => setForm((c) => ({ ...c, isFeatured: !c.isFeatured }))}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          setForm((c) => ({ ...c, isFeatured: !c.isFeatured }));
        }
      }}
      className={`modern-toggle-card ${form.isFeatured ? 'is-active-featured' : ''}`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs transition-colors ${
            form.isFeatured ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'
          }`}
        >
          ⭐
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-slate-900 leading-tight">Öne Çıkan Ürün</p>
            {form.isFeatured && (
              <span className="rounded bg-amber-100 px-1 py-0.2 text-[9px] font-bold uppercase tracking-wider text-amber-700">
                Vitrin
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500">
            {form.isFeatured ? 'Menünün başında parıldar' : 'Standart menü listelemesi'}
          </p>
        </div>
      </div>
      <div className={`modern-switch-track ${form.isFeatured ? 'is-on--featured' : ''}`}>
        <div className="modern-switch-thumb" />
      </div>
    </div>
  </div>
);

const initialForm = (categoryId) => ({
  categoryId,
  name: '',
  price: '',
  oldPrice: '',
  shortDescription: '',
  description: '',
  ingredients: [],
  allergens: [],
  calories: '',
  dietaryTags: [],
  isAvailable: true,
  isFeatured: false,
  displayOrder: 0,
});

const toForm = (product) => ({
  categoryId: product.categoryId?._id || product.categoryId,
  name: product.name || '',
  price: product.price ?? '',
  oldPrice: product.oldPrice ?? '',
  shortDescription: product.shortDescription || '',
  description: product.description || '',
  ingredients: Array.isArray(product.ingredients)
    ? product.ingredients
    : (product.ingredients || '').split(',').map((s) => s.trim()).filter(Boolean),
  allergens: Array.isArray(product.allergens)
    ? product.allergens
    : (product.allergens || '').split(',').map((s) => s.trim()).filter(Boolean),
  calories: product.calories ?? '',
  dietaryTags: Array.isArray(product.dietaryTags) ? product.dietaryTags : [],
  isAvailable: product.isAvailable !== false,
  isFeatured: Boolean(product.isFeatured),
  displayOrder: product.displayOrder ?? 0,
});

export const ProductModal = ({ product, categoryId, categories, onClose, onSaved }) => {
  const [form, setForm] = useState(product ? toForm(product) : initialForm(categoryId));
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.image || '');
  const [optimizationInfo, setOptimizationInfo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  // Site Global Top-Center Toast (3s fade in/out standard)
  const [siteToast, setSiteToast] = useState(null); // { message, type: 'error' | 'warning' | 'success', id: number }
  const toastTimeoutRef = useRef(null);

  const showToast = (message, type = 'error') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setSiteToast({ message, type, id: Date.now() });
    toastTimeoutRef.current = setTimeout(() => {
      setSiteToast(null);
    }, 3000);
  };

  // Smart Product Suggestions & Custom Category Dropdown State
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const productInputContainerRef = useRef(null);
  const categorySelectContainerRef = useRef(null);

  // AI Description Generator State
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [streamState, setStreamState] = useState('idle'); // 'idle' | 'thinking' | 'streaming' | 'completed'
  const [isCalorieAiSuggested, setIsCalorieAiSuggested] = useState(false);
  const thinkTimeoutRef = useRef(null);
  const streamIntervalRef = useRef(null);
  const lastGeneratedTextRef = useRef('');

  // Selected category helper
  const selectedCategory = useMemo(() => {
    return categories.find((c) => (c._id || c) === form.categoryId);
  }, [categories, form.categoryId]);

  const selectedCategoryName = selectedCategory?.name || '';

  // Filtered product suggestions (max 5 items, category-aware on empty, global when typed)
  const filteredProductSuggestions = useMemo(() => {
    return getFilteredProductSuggestions(form.name, selectedCategoryName);
  }, [form.name, selectedCategoryName]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (thinkTimeoutRef.current) clearTimeout(thinkTimeoutRef.current);
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Dismiss suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        productInputContainerRef.current &&
        !productInputContainerRef.current.contains(event.target)
      ) {
        setShowProductSuggestions(false);
      }
      if (
        categorySelectContainerRef.current &&
        !categorySelectContainerRef.current.contains(event.target)
      ) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClose = (callback) => {
    if (isClosing) return;
    if (thinkTimeoutRef.current) clearTimeout(thinkTimeoutRef.current);
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    setIsClosing(true);
    setTimeout(() => {
      if (typeof callback === 'function') callback();
      else if (typeof onClose === 'function') onClose();
    }, 200);
  };

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (showProductSuggestions) {
          event.stopPropagation();
          setShowProductSuggestions(false);
        } else {
          handleClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isClosing, showProductSuggestions]);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleTag = (tag) => setForm((current) => ({
    ...current,
    dietaryTags: current.dietaryTags.includes(tag)
      ? current.dietaryTags.filter((item) => item !== tag)
      : [...current.dietaryTags, tag],
  }));

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Yalnızca JPG, PNG veya WEBP görseller yükleyebilirsiniz.', 'error');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      showToast('Görsel boyutu 15 MB değerinden küçük olmalıdır.', 'error');
      return;
    }
    setProcessing(true);
    try {
      const result = await compressImageToWebp(file, { maxDimension: 1200, quality: 0.88 });
      setImageFile(result.file);
      setImagePreview(result.previewUrl);
      setOptimizationInfo(result);
    } catch (err) {
      console.error('Image compression failed, using original file:', err);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setOptimizationInfo(null);
    } finally {
      setProcessing(false);
    }
  };

  const removeImage = async () => {
    if (!product?.image) {
      setImageFile(null);
      setImagePreview('');
      setOptimizationInfo(null);
      return;
    }
    setUploading(true);
    try {
      await menuService.removeProductImage(product._id);
      setImageFile(null);
      setImagePreview('');
      setOptimizationInfo(null);
    } catch (err) {
      showToast(err.response?.data?.error || 'Görsel kaldırılamadı.', 'error');
    } finally {
      setUploading(false);
    }
  };

  /**
   * ZuuAI Description & Product Details Generator with streaming feedback & safe fallbacks
   */
  const handleGenerateDescription = async () => {
    if (isGeneratingDesc) return;

    if (!form.name.trim()) {
      showToast('Lütfen önce bir ürün adı girin.', 'warning');
      return;
    }

    const categoryName = selectedCategoryName;
    const currentDesc = (form.description || '').trim();

    // If description already has the generated text untouched, show hint
    if (
      currentDesc &&
      lastGeneratedTextRef.current &&
      currentDesc === lastGeneratedTextRef.current.trim()
    ) {
      showToast('Daha fazla açıklama önerisi için ZuuAI ile sohbet edebilirsiniz.', 'warning');
      return;
    }

    if (thinkTimeoutRef.current) clearTimeout(thinkTimeoutRef.current);
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);

    setIsGeneratingDesc(true);
    setStreamState('thinking');

    try {
      let targetText = '';
      let suggestedCalories = null;
      let suggestedIngredients = [];
      let suggestedAllergens = [];
      let suggestedDietaryTags = [];

      try {
        const aiRes = await suggestProductDetails({
          name: form.name.trim(),
          categoryName,
          currentDescription: currentDesc,
          ingredients: form.ingredients,
          allergens: form.allergens,
          dietaryTags: form.dietaryTags,
        });
        if (aiRes?.data) {
          targetText = aiRes.data.description || '';
          suggestedCalories = aiRes.data.calories;
          suggestedIngredients = aiRes.data.ingredients || [];
          suggestedAllergens = aiRes.data.allergens || [];
          suggestedDietaryTags = aiRes.data.dietaryTags || [];
        }
      } catch (aiErr) {
        console.warn('AI product suggestion API fallback to local catalogue:', aiErr.message);
      }

      if (!targetText) {
        targetText = generateProductDescriptionText(form.name, categoryName);
      }

      // Apply extra suggestions if fields are currently empty
      if (suggestedCalories !== null && (form.calories === '' || form.calories === null || form.calories === undefined)) {
        setForm((curr) => ({ ...curr, calories: suggestedCalories }));
        setIsCalorieAiSuggested(true);
      }

      if (suggestedIngredients.length > 0 && (!form.ingredients || form.ingredients.length === 0)) {
        setForm((curr) => ({ ...curr, ingredients: suggestedIngredients }));
      }

      if (suggestedAllergens.length > 0 && (!form.allergens || form.allergens.length === 0)) {
        setForm((curr) => ({ ...curr, allergens: suggestedAllergens }));
      }

      if (suggestedDietaryTags.length > 0 && (!form.dietaryTags || form.dietaryTags.length === 0)) {
        setForm((curr) => ({ ...curr, dietaryTags: suggestedDietaryTags }));
      }

      setStreamState('streaming');
      setForm((curr) => ({ ...curr, description: '' }));

      // Phase 2: Smooth text stream
      const totalDuration = 1800;
      const textLength = targetText.length;
      const startTime = performance.now();

      streamIntervalRef.current = setInterval(() => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / totalDuration);
        const currentLength = Math.floor(progress * textLength);

        setForm((curr) => ({ ...curr, description: targetText.slice(0, currentLength) }));

        if (progress >= 1) {
          clearInterval(streamIntervalRef.current);
          setForm((curr) => ({ ...curr, description: targetText }));
          lastGeneratedTextRef.current = targetText;
          setIsGeneratingDesc(false);
          setStreamState('completed');
          setTimeout(() => {
            setStreamState('idle');
          }, 850);
        }
      }, 30);
    } catch (err) {
      console.error('Failed to generate product description:', err);
      setIsGeneratingDesc(false);
      setStreamState('idle');
      showToast('Açıklama oluşturulamadı. Lütfen manuel olarak devam edin.', 'warning');
    }
  };

  const handleSelectProductSuggestion = (item) => {
    setForm((current) => {
      const updated = { ...current, name: item.name };
      // Auto-suggest short description if empty
      if (!updated.shortDescription && item.shortDescription) {
        updated.shortDescription = item.shortDescription;
      }
      return updated;
    });
    setShowProductSuggestions(false);
  };

  const handleNextStep = () => {
    if (activeStep === 1) {
      if (!form.name.trim()) {
        return showToast('Ürün adı zorunludur.', 'error');
      }
      if (form.price === '' || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
        return showToast('Fiyat sıfır veya daha büyük geçerli bir sayı olmalıdır.', 'error');
      }
      if (form.calories === '' || form.calories === null || form.calories === undefined || Number.isNaN(Number(form.calories)) || Number(form.calories) < 0) {
        return showToast('Kalori bilgisi zorunludur (0 veya daha büyük bir sayı giriniz).', 'error');
      }
    }
    setActiveStep((prev) => Math.min(3, prev + 1));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setActiveStep(1);
      return showToast('Ürün adı zorunludur.', 'error');
    }
    if (form.price === '' || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
      setActiveStep(1);
      return showToast('Fiyat sıfır veya daha büyük geçerli bir sayı olmalıdır.', 'error');
    }
    if (form.calories === '' || form.calories === null || form.calories === undefined || Number.isNaN(Number(form.calories)) || Number(form.calories) < 0) {
      setActiveStep(1);
      return showToast('Kalori bilgisi zorunludur (0 veya daha büyük bir sayı giriniz).', 'error');
    }
    const cleanAllergens = form.allergens.map((item) => String(item).trim()).filter(Boolean);
    if (cleanAllergens.length === 0) {
      setActiveStep(3);
      return showToast('Alerjen bilgisi zorunludur. Alerjen yoksa "Alerjen İçermez" ekleyin.', 'error');
    }
    setSaving(true);

    const payload = {
      ...form,
      name: form.name.trim(),
      price: Number(form.price),
      oldPrice: form.oldPrice === '' ? null : Number(form.oldPrice),
      calories: form.calories === '' ? null : Number(form.calories),
      displayOrder: Number(form.displayOrder),
      ingredients: form.ingredients.map((item) => String(item).trim()).filter(Boolean),
      allergens: form.allergens.map((item) => String(item).trim()).filter(Boolean),
    };

    try {
      const result = product
        ? await menuService.updateProduct(product._id, payload)
        : await menuService.createProduct(payload);
      let finalProduct = result.product;
      if (imageFile) {
        setUploading(true);
        const imgResult = await menuService.uploadProductImage(result.product._id, imageFile);
        if (imgResult?.product) finalProduct = imgResult.product;
        else if (imgResult?.image) finalProduct = { ...finalProduct, image: imgResult.image };
        setUploading(false);
      }
      handleClose(() => onSaved(result.message, finalProduct));
    } catch (err) {
      showToast(err.response?.data?.error || 'Ürün kaydedilemedi.', 'error');
      setUploading(false);
    } finally {
      setSaving(false);
    }
  };

  const modalContent = (
    <>
      {/* Site-wide Global Top-Center Toast (3s Fade In/Out Standard) */}
      {siteToast && typeof document !== 'undefined' && createPortal(
        <div
          key={siteToast.id}
          className={`site-global-toast site-global-toast--${siteToast.type}`}
          role="alert"
        >
          <span>{siteToast.type === 'error' ? '⚠️' : siteToast.type === 'warning' ? '💡' : '✓'}</span>
          <span>{siteToast.message}</span>
        </div>,
        document.body
      )}
      <div
        className={`product-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto ${
          isClosing ? 'is-closing' : ''
        }`}
        role="presentation"
        onMouseDown={(event) => event.target === event.currentTarget && handleClose()}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-dialog-title"
          className={`product-modal-panel relative w-full max-w-xl rounded-2xl bg-white p-5 sm:p-6 shadow-2xl transition-all duration-200 my-auto ${
            isClosing ? 'is-closing' : ''
          }`}
        >
          {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <p className="text-sm font-medium text-emerald-600">Menü</p>
            <h2 id="product-dialog-title" className="mt-1 text-xl font-semibold text-slate-900">
              {product ? 'Ürünü düzenle' : 'Ürün ekle'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => handleClose()}
            className="text-2xl leading-none text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Kapat"
          >
            ×
          </button>
        </div>

        {/* Step Navigation Tabs */}
        <div className="mt-3.5 flex items-center justify-between border-b border-slate-100 bg-slate-50/80 p-1 rounded-xl">
          {[
            { id: 1, label: 'Temel Bilgiler', short: '1. Temel' },
            { id: 2, label: 'Görsel & Açıklama', short: '2. Görsel' },
            { id: 3, label: 'İçerik & Etiketler', short: '3. Detaylar' },
          ].map((s) => {
            const isActive = activeStep === s.id;
            const isDone = activeStep > s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  if (activeStep === 1 && s.id > 1) {
                    if (!form.name.trim()) return showToast('Ürün adı zorunludur.', 'error');
                    if (form.price === '' || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
                      return showToast('Fiyat sıfır veya daha büyük geçerli bir sayı olmalıdır.', 'error');
                    }
                    if (form.calories === '' || form.calories === null || form.calories === undefined || Number.isNaN(Number(form.calories)) || Number(form.calories) < 0) {
                      return showToast('Kalori bilgisi zorunludur (0 veya daha büyük bir sayı giriniz).', 'error');
                    }
                  }
                  setActiveStep(s.id);
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-bold'
                    : isDone
                    ? 'text-emerald-700 hover:text-emerald-800'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : isDone
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isDone ? '✓' : s.id}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.short}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          {/* Step 1: Temel Bilgiler (Ürün Adı, Kategori, Fiyatlandırma) */}
          {activeStep === 1 && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Ürün Adı with Top-5 Autocomplete */}
                <div ref={productInputContainerRef} className="relative z-30">
                  <label htmlFor="product-name-input" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Ürün adı <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="product-name-input"
                    name="name"
                    value={form.name}
                    onChange={(e) => {
                      updateField(e);
                      setShowProductSuggestions(true);
                    }}
                    onFocus={() => setShowProductSuggestions(true)}
                    autoComplete="off"
                    className="field-input w-full"
                    placeholder="Örn. Mercimek Çorbası"
                  />
                  {/* Top-5 Product Autocomplete Dropdown */}
                  {showProductSuggestions && filteredProductSuggestions.length > 0 && (
                    <div className="product-suggestions-dropdown">
                      <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        {form.name.trim() ? 'Tüm Kategorilerden Öneriler' : `${selectedCategoryName || 'Kategori'} Önerileri`}
                      </div>
                      {filteredProductSuggestions.map((item) => (
                        <button
                          key={item.name}
                          type="button"
                          className="product-suggestion-item"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectProductSuggestion(item);
                          }}
                        >
                          <span className="font-medium text-slate-900">{item.name}</span>
                          {item.category && (
                            <span className="product-suggestion-item__cat">{item.category}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Kategori Seçimi with Custom Animated Dropdown */}
                <div ref={categorySelectContainerRef} className="relative z-20">
                  <label id="product-category-label" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Kategori <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={showCategoryDropdown}
                    onClick={() => setShowCategoryDropdown((prev) => !prev)}
                    className={`field-input custom-category-select-btn w-full flex items-center justify-between ${
                      showCategoryDropdown ? 'is-open ring-2 ring-slate-900/10' : ''
                    }`}
                  >
                    <span className="truncate font-medium text-slate-900">
                      {selectedCategoryName || 'Kategori Seçin'}
                    </span>
                    <svg
                      className="chevron-icon h-4 w-4 text-slate-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showCategoryDropdown && (
                    <div className="product-suggestions-dropdown" role="listbox" aria-labelledby="product-category-label">
                      <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Kategoriler
                      </div>
                      {categories.map((cat) => {
                        const isSelected = (cat._id || cat) === form.categoryId;
                        return (
                          <button
                            key={cat._id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            className={`product-suggestion-item ${isSelected ? 'is-selected font-semibold bg-slate-100' : ''}`}
                            onClick={() => {
                              setForm((curr) => ({ ...curr, categoryId: cat._id }));
                              setShowCategoryDropdown(false);
                            }}
                          >
                            <span className="font-medium text-slate-900">{cat.name}</span>
                            {isSelected && <span className="text-xs text-emerald-600 font-bold">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Fiyat ve Porsiyon Bilgileri */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
                <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Fiyat (₺) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={updateField}
                      className="field-input w-full font-semibold"
                      placeholder="120"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Eski fiyat <span className="text-slate-400 font-normal">(ops.)</span>
                    </label>
                    <input
                      name="oldPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.oldPrice}
                      onChange={updateField}
                      className="field-input w-full"
                      placeholder="150"
                    />
                  </div>
                  <div>
                    <label className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Kalori (kcal) <span className="text-rose-500">*</span></span>
                      {isCalorieAiSuggested && (
                        <span className="text-[10px] font-medium text-amber-600">ZuuAI tahmini</span>
                      )}
                    </label>
                    <input
                      name="calories"
                      type="number"
                      min="0"
                      step="1"
                      value={form.calories}
                      onChange={(e) => {
                        updateField(e);
                        setIsCalorieAiSuggested(false);
                      }}
                      className="field-input w-full"
                      placeholder="Örn. 350"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Menü Sırası
                    </label>
                    <input
                      name="displayOrder"
                      type="number"
                      min="0"
                      step="1"
                      value={form.displayOrder}
                      onChange={updateField}
                      className="field-input w-full"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Görsel & Açıklama */}
          {activeStep === 2 && (
            <div className="space-y-3.5 animate-fadeIn">
              {/* Görsel Yükleme Kartı */}
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-3.5 transition-colors hover:border-slate-400">
                <div className="flex flex-wrap items-center gap-3.5">
                  <div className="product-image-preview">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Ürün önizlemesi" />
                    ) : (
                      <span className="text-slate-400 text-xs text-center font-medium">Görsel Seç</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">Ürün Görseli</p>
                    <p className="text-[11px] text-slate-500">
                      JPG, PNG veya WEBP (Otomatik optimize edilir)
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <label className="cursor-pointer rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        Görsel Seç
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageChange}
                          className="sr-only"
                          disabled={saving || uploading || processing}
                        />
                      </label>
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={removeImage}
                          disabled={saving || uploading || processing}
                          className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50 transition-colors"
                        >
                          Kaldır
                        </button>
                      )}
                    </div>
                    {processing && (
                      <p className="mt-1.5 text-xs font-medium text-emerald-600 animate-pulse">Görsel hazırlanıyor...</p>
                    )}
                    {optimizationInfo && !processing && (
                      <p className="mt-1.5 text-xs font-medium text-emerald-600 flex items-center gap-1.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Görsel optimize edildi
                      </p>
                    )}
                    {uploading && <p className="mt-1.5 text-xs font-medium text-emerald-600">Kaydediliyor...</p>}
                  </div>
                </div>
              </div>

              {/* Açıklamalar */}
              <div className="space-y-2.5">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Kısa açıklama <span className="text-slate-400 font-normal lowercase">(menü kartlarında görünür)</span>
                  </label>
                  <input
                    name="shortDescription"
                    value={form.shortDescription}
                    onChange={updateField}
                    className="field-input w-full"
                    placeholder="Örn. Tereyağlı taze kruton ekmek ve nane sosu ile"
                  />
                </div>

                {/* Detaylı Açıklama with ZuuAI Sparkle Generator */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Detaylı Açıklama <span className="text-slate-400 font-normal lowercase">(opsiyonel)</span>
                    </label>
                    <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                      ✨ ZuuAI önerisi
                    </span>
                  </div>
                  <div className="category-ai-textarea-wrapper">
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={updateField}
                      rows="2"
                      className={`category-textarea field-input w-full resize-none pl-3 pr-11 py-2 text-sm outline-none transition-all duration-300 ${
                        isGeneratingDesc
                          ? 'is-generating'
                          : streamState === 'completed'
                          ? 'is-completed'
                          : ''
                      }`}
                      placeholder={
                        isGeneratingDesc
                          ? 'ZuuAI öneri hazırlıyor...'
                          : 'Ürün hakkında detaylı iştah açıcı açıklama...'
                      }
                    />

                    {/* Soft modern AI floating mini pill */}
                    {isGeneratingDesc && (
                      <div className="category-ai-soft-pill" aria-hidden="true">
                        <span className="category-ai-soft-dot" />
                        <span className="category-ai-soft-text">
                          {streamState === 'thinking' ? 'ZuuAI hazırlanıyor' : 'Yazılıyor'}
                        </span>
                      </div>
                    )}

                    {/* Sparkle Generator Button */}
                    <button
                      type="button"
                      onClick={handleGenerateDescription}
                      disabled={isGeneratingDesc}
                      className={`category-sparkle-btn ${isGeneratingDesc ? 'is-generating' : ''}`}
                      aria-label={
                        isGeneratingDesc
                          ? 'Açıklama hazırlanıyor...'
                          : form.name.trim()
                          ? 'ZuuAI ile öner'
                          : 'Açıklama önerisi için ürün adı girin'
                      }
                      title={
                        isGeneratingDesc
                          ? 'Açıklama hazırlanıyor...'
                          : form.name.trim()
                          ? 'ZuuAI ile öner'
                          : 'Açıklama önerisi için ürün adı girin'
                      }
                    >
                      <IconSparkle size={13} className="category-sparkle-icon" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: İçerik & Etiketler */}
          {activeStep === 3 && (
            <div className="space-y-3.5 animate-fadeIn">
              {/* İçindekiler ve Alerjenler (Akıllı Çip / Tag Girişi) */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    İçindekiler <span className="text-slate-400 font-normal lowercase">(Enter ile ekle)</span>
                  </label>
                  <TagInput
                    tags={form.ingredients}
                    onChange={(tags) => setForm((c) => ({ ...c, ingredients: tags }))}
                    placeholder="Örn. Domates, Soğan"
                    suggestionsList={COMMON_INGREDIENTS}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Alerjenler <span className="text-rose-500">*</span> <span className="text-slate-400 font-normal lowercase">(Enter ile ekle)</span>
                  </label>
                  <TagInput
                    tags={form.allergens}
                    onChange={(tags) => setForm((c) => ({ ...c, allergens: tags }))}
                    placeholder="Örn. Süt, Gluten veya Alerjen İçermez"
                    suggestionsList={COMMON_ALLERGENS}
                  />
                </div>
              </div>

              {/* Etiketler ve Özellikler (Diyet & Lezzet Rozetleri) */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 space-y-2.5">
                <div className="space-y-2">
                  {DIETARY_GROUPS.map((group) => (
                    <div key={group.title}>
                      <p className="product-badge-group-title text-[11px] mb-1">{group.title}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {group.options.map((opt) => {
                          const isActive = form.dietaryTags.includes(opt.value);
                          return (
                            <button
                              type="button"
                              key={opt.value}
                              onClick={() => toggleTag(opt.value)}
                              className={`product-tag-toggle-btn text-xs py-1 px-2.5 ${isActive ? 'is-active' : ''}`}
                            >
                              <span>{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Durum & Görünürlük Switchleri (Satışta On/Off & Öne Çıkan) */}
                <div className="pt-2 border-t border-slate-200/60">
                  <StatusSwitches form={form} setForm={setForm} />
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-4">
            <button
              type="button"
              onClick={() => handleClose()}
              className="rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              Vazgeç
            </button>

            <div className="flex items-center gap-2">
              {activeStep > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => prev - 1)}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  ← Geri
                </button>
              )}

              {activeStep < 3 && product && (
                <button
                  type="submit"
                  disabled={saving || uploading || processing}
                  className="hidden sm:inline-flex rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Hemen Kaydet
                </button>
              )}

              {activeStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  İleri →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={saving || uploading || processing}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-slate-800 disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {processing
                    ? 'Optimize ediliyor...'
                    : uploading
                    ? 'Yükleniyor...'
                    : saving
                    ? 'Kaydediliyor...'
                    : product
                    ? 'Değişiklikleri kaydet'
                    : 'Ürün oluştur'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
    </>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};

const ProductManager = ({ category, products, categories, onChanged, onMessage }) => {
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionId, setActionId] = useState(null);

  const saved = (message) => {
    setModalOpen(false);
    setEditingProduct(null);
    onMessage(message);
    onChanged();
  };

  const runAction = async (product, action, message) => {
    if (message && !window.confirm(message)) return;
    setActionId(product._id);
    try {
      const result =
        action === 'delete'
          ? await menuService.deleteProduct(product._id)
          : await menuService[action](product._id);
      onMessage(result.message);
      await onChanged();
    } catch (err) {
      onMessage(err.response?.data?.error || 'Ürün işlemi başarısız oldu.', true);
    } finally {
      setActionId(null);
    }
  };

  const move = async (index, direction) => {
    const next = direction === 'up' ? index - 1 : index + 1;
    if (next < 0 || next >= products.length) return;
    setActionId(products[index]._id);
    try {
      await Promise.all([
        menuService.updateProduct(products[index]._id, { displayOrder: products[next].displayOrder }),
        menuService.updateProduct(products[next]._id, { displayOrder: products[index].displayOrder }),
      ]);
      onMessage('Ürün sırası güncellendi.');
      await onChanged();
    } catch (err) {
      onMessage(err.response?.data?.error || 'Ürün sırası güncellenemedi.', true);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="mt-5 border-t border-slate-100 pt-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Ürünler</p>
        <button
          onClick={() => {
            setEditingProduct(null);
            setModalOpen(true);
          }}
          className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
        >
          + Ürün Ekle
        </button>
      </div>
      {products.length === 0 ? (
        <div className="rounded-xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
          Bu kategoride henüz ürün yok.
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product, index) => (
            <div
              key={product._id}
              className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">{product.name}</p>
                  <span
                    className={`text-xs font-semibold ${
                      product.isAvailable ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {product.isAvailable ? '● Mevcut' : '○ Tükendi'}
                  </span>
                  {product.isFeatured && (
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                      Öne Çıkan
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  ₺{Number(product.price).toFixed(2)}
                </p>
                {product.shortDescription && (
                  <p className="mt-1 truncate text-xs text-slate-500">{product.shortDescription}</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  disabled={!!actionId || index === 0}
                  onClick={() => move(index, 'up')}
                  className="small-action disabled:opacity-40"
                  aria-label="Yukarı taşı"
                >
                  ↑
                </button>
                <button
                  disabled={!!actionId || index === products.length - 1}
                  onClick={() => move(index, 'down')}
                  className="small-action disabled:opacity-40"
                  aria-label="Aşağı taşı"
                >
                  ↓
                </button>
                <button
                  disabled={!!actionId}
                  onClick={() => {
                    setEditingProduct(product);
                    setModalOpen(true);
                  }}
                  className="small-action"
                >
                  Düzenle
                </button>
                <button
                  disabled={!!actionId}
                  onClick={() => runAction(product, 'toggleAvailability')}
                  className="small-action"
                >
                  {product.isAvailable ? 'Tükendi' : 'Mevcut'}
                </button>
                <button
                  disabled={!!actionId}
                  onClick={() => runAction(product, 'toggleFeatured')}
                  className="small-action"
                >
                  {product.isFeatured ? 'Öne çıkandan çıkar' : 'Öne çıkar'}
                </button>
                <button
                  disabled={!!actionId}
                  onClick={() => runAction(product, 'delete', 'Bu ürünü silmek istediğinize emin misiniz?')}
                  className="small-action text-rose-600 hover:bg-rose-50"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {modalOpen && (
        <ProductModal
          product={editingProduct}
          categoryId={category._id}
          categories={categories}
          onClose={() => {
            setModalOpen(false);
            setEditingProduct(null);
          }}
          onSaved={saved}
        />
      )}
    </div>
  );
};

export default ProductManager;
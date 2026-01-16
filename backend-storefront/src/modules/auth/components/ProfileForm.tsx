// src/modules/auth/components/ProfileForm.tsx
// ============================================================================
// Formulaire Profil - Hotel Booking Bloc 3
//
// Différence Angular → React :
// - Angular : @Component class avec propriétés, [(ngModel)], (ngSubmit)
// - React : Function component avec useState, value + onChange, onSubmit
//
// - Angular : ChangeDetectorRef.markForCheck() pour OnPush
// - React : Automatique avec setState (re-render)
//
// - Angular : *ngIf="editMode" pour affichage conditionnel
// - React : {editMode && <div>...</div>} ou ternaire
// ============================================================================

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { 
  FiEdit2, 
  FiSave, 
  FiX, 
  FiKey, 
  FiEye, 
  FiEyeOff,
  FiLock,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin
} from "react-icons/fi";

// ============================================================================
// TYPES
// ============================================================================
interface ProfileFormData {
  nom: string;
  prenom: string;
  tel: string;
  adresse: {
    rue: string;
    complement: string;
    code_postal: string;
    ville: string;
    pays: string;
  };
}

interface PasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FullProfile {
  id_user: number;
  nom: string;
  prenom: string;
  email: string;
  tel: string | null;
  role: string;
  nom_role: string;
  date_inscription: string;
  derniere_connexion: string | null;
  adresse: {
    rue: string | null;
    complement: string | null;
    code_postal: string | null;
    ville: string | null;
    pays: string | null;
  } | null;
}

// ============================================================================
// COMPOSANT
// ============================================================================
export default function ProfileForm() {
  // Hook Auth (équivalent Angular: constructor(public authService: AuthService))
  const { user, refreshUser } = useAuth();

  // États du profil complet (chargé depuis l'API)
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Mode édition (équivalent Angular: editMode: boolean = false)
  const [editMode, setEditMode] = useState(false);

  // Formulaire profil (équivalent Angular: profileForm = { prenom: '', nom: '', ... })
  const [formData, setFormData] = useState<ProfileFormData>({
    nom: "",
    prenom: "",
    tel: "",
    adresse: {
      rue: "",
      complement: "",
      code_postal: "",
      ville: "",
      pays: "",
    },
  });

  // Formulaire mot de passe
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Toggle visibilité mots de passe (équivalent Angular: showOldPassword, etc.)
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // États de soumission
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ============================================================================
  // CHARGEMENT DU PROFIL
  // Équivalent Angular: ngOnInit() ou constructor avec this.loadUserData()
  // ============================================================================
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch("/api/auth/profile");
      const data = await response.json();

      if (data.success) {
        setProfile(data.user);
        // Initialiser le formulaire avec les données
        setFormData({
          nom: data.user.nom || "",
          prenom: data.user.prenom || "",
          tel: data.user.tel || "",
          adresse: {
            rue: data.user.adresse?.rue || "",
            complement: data.user.adresse?.complement || "",
            code_postal: data.user.adresse?.code_postal || "",
            ville: data.user.adresse?.ville || "",
            pays: data.user.adresse?.pays || "",
          },
        });
      }
    } catch (error) {
      console.error("Erreur chargement profil:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  // ============================================================================
  // TOGGLE MODE ÉDITION
  // Équivalent Angular: toggleEditMode() avec cdr.markForCheck()
  // ============================================================================
  const toggleEditMode = () => {
    if (editMode && profile) {
      // Reset si on annule (comme Angular ligne 62-65)
      setFormData({
        nom: profile.nom || "",
        prenom: profile.prenom || "",
        tel: profile.tel || "",
        adresse: {
          rue: profile.adresse?.rue || "",
          complement: profile.adresse?.complement || "",
          code_postal: profile.adresse?.code_postal || "",
          ville: profile.adresse?.ville || "",
          pays: profile.adresse?.pays || "",
        },
      });
    }
    setEditMode(!editMode);
    setMessage(null);
  };

  // ============================================================================
  // SAUVEGARDE PROFIL
  // Équivalent Angular: saveProfile() avec Observable.subscribe()
  // ============================================================================
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation (comme Angular ligne 69-72)
    if (!formData.prenom || !formData.nom) {
      setMessage({ type: "error", text: "Le prénom et le nom sont obligatoires" });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Profil mis à jour avec succès" });
        setEditMode(false);
        await loadProfile(); // Recharger les données
        await refreshUser(); // Mettre à jour le contexte Auth (header, etc.)
      } else {
        setMessage({ type: "error", text: data.error || "Erreur lors de la mise à jour" });
      }
    } catch (error) {
      console.error("Erreur sauvegarde profil:", error);
      setMessage({ type: "error", text: "Erreur lors de la mise à jour du profil" });
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================================
  // TOGGLE FORMULAIRE MOT DE PASSE
  // Équivalent Angular: togglePasswordForm()
  // ============================================================================
  const togglePasswordForm = () => {
    if (showPasswordForm) {
      // Reset (comme Angular ligne 94-99)
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
    setShowPasswordForm(!showPasswordForm);
    setMessage(null);
  };

  // ============================================================================
  // CHANGEMENT MOT DE PASSE
  // Équivalent Angular: changePassword() avec validation
  // ============================================================================
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation (comme Angular lignes 105-119)
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "Veuillez remplir tous les champs" });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: "error", text: "Le nouveau mot de passe doit contenir au moins 6 caractères" });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "Les mots de passe ne correspondent pas" });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Mot de passe modifié avec succès" });
        setShowPasswordForm(false);
        setPasswordForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setMessage({ type: "error", text: data.error || "Erreur lors du changement de mot de passe" });
      }
    } catch (error) {
      console.error("Erreur changement mot de passe:", error);
      setMessage({ type: "error", text: "Erreur lors du changement de mot de passe" });
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================================
  // HANDLERS INPUT
  // Équivalent Angular: [(ngModel)] two-way binding
  // React: value + onChange (one-way binding explicite)
  // ============================================================================
  const handleInputChange = (field: keyof Omit<ProfileFormData, "adresse">, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdresseChange = (field: keyof ProfileFormData["adresse"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      adresse: { ...prev.adresse, [field]: value },
    }));
  };

  const handlePasswordChange = (field: keyof PasswordFormData, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  // ============================================================================
  // FORMAT DATE
  // ============================================================================
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non disponible";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  if (loadingProfile) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // Équivalent du template Angular (profil.html)
  // ============================================================================
  return (
    <div className="space-y-6">
      {/* Message de succès/erreur */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ================================================================== */}
      {/* CARD INFORMATIONS PERSONNELLES */}
      {/* Équivalent Angular: <div class="card border-0 shadow-sm mb-4"> */}
      {/* ================================================================== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          {/* Header avec bouton éditer */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiUser className="w-5 h-5 text-cyan-600" />
              Informations personnelles
            </h2>
            {!editMode && (
              <button
                onClick={toggleEditMode}
                className="flex items-center gap-2 px-4 py-2 text-sm text-cyan-600 border border-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors"
              >
                <FiEdit2 className="w-4 h-4" />
                Modifier
              </button>
            )}
          </div>

          {/* ============================================================ */}
          {/* MODE LECTURE - Équivalent Angular: *ngIf="!editMode" */}
          {/* ============================================================ */}
          {!editMode && profile && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Prénom</span>
                  <p className="text-gray-900">{profile.prenom}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Nom</span>
                  <p className="text-gray-900">{profile.nom}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Rôle</span>
                  <p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                      {profile.nom_role}
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <FiMail className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email</span>
                    <p className="text-gray-900">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FiPhone className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <span className="text-sm font-medium text-gray-500">Téléphone</span>
                    <p className="text-gray-900">{profile.tel || "Non renseigné"}</p>
                  </div>
                </div>
              </div>

              {/* Adresse */}
              {profile.adresse && (
                <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
                  <FiMapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <span className="text-sm font-medium text-gray-500">Adresse</span>
                    <p className="text-gray-900">
                      {profile.adresse.rue && `${profile.adresse.rue}`}
                      {profile.adresse.complement && `, ${profile.adresse.complement}`}
                      <br />
                      {profile.adresse.code_postal && `${profile.adresse.code_postal} `}
                      {profile.adresse.ville && `${profile.adresse.ville}`}
                      {profile.adresse.pays && `, ${profile.adresse.pays}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                <div>
                  <span className="font-medium">Membre depuis :</span>{" "}
                  {formatDate(profile.date_inscription)}
                </div>
                <div>
                  <span className="font-medium">Dernière connexion :</span>{" "}
                  {formatDate(profile.derniere_connexion)}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* MODE ÉDITION - Équivalent Angular: *ngIf="editMode" */}
          {/* ============================================================ */}
          {editMode && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Prénom / Nom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => handleInputChange("prenom", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => handleInputChange("nom", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Email (disabled) + Téléphone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.tel}
                    onChange={(e) => handleInputChange("tel", e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              {/* Adresse */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                  <FiMapPin className="w-4 h-4" />
                  Adresse
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={formData.adresse.rue}
                    onChange={(e) => handleAdresseChange("rue", e.target.value)}
                    placeholder="Rue"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  />
                  <input
                    type="text"
                    value={formData.adresse.complement}
                    onChange={(e) => handleAdresseChange("complement", e.target.value)}
                    placeholder="Complément d'adresse"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={formData.adresse.code_postal}
                      onChange={(e) => handleAdresseChange("code_postal", e.target.value)}
                      placeholder="Code postal"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                    />
                    <input
                      type="text"
                      value={formData.adresse.ville}
                      onChange={(e) => handleAdresseChange("ville", e.target.value)}
                      placeholder="Ville"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                    />
                    <input
                      type="text"
                      value={formData.adresse.pays}
                      onChange={(e) => handleAdresseChange("pays", e.target.value)}
                      placeholder="Pays"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4" />
                      Enregistrer
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={toggleEditMode}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ================================================================== */}
      {/* CARD MOT DE PASSE */}
      {/* Équivalent Angular: <div class="card border-0 shadow-sm"> */}
      {/* ================================================================== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiLock className="w-5 h-5 text-cyan-600" />
              Mot de passe
            </h2>
            {!showPasswordForm && (
              <button
                onClick={togglePasswordForm}
                className="flex items-center gap-2 px-4 py-2 text-sm text-cyan-600 border border-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors"
              >
                <FiKey className="w-4 h-4" />
                Modifier
              </button>
            )}
          </div>

          {/* Mode lecture */}
          {!showPasswordForm && (
            <p className="text-gray-500 flex items-center gap-2">
              <FiLock className="w-4 h-4" />
              Votre mot de passe est sécurisé
            </p>
          )}

          {/* Formulaire changement mot de passe */}
          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Ancien mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe actuel <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={passwordForm.oldPassword}
                    onChange={(e) => handlePasswordChange("oldPassword", e.target.value)}
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors"
                  >
                    {showOldPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Nouveau mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors"
                  >
                    {showNewPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
              </div>

              {/* Confirmer mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le nouveau mot de passe <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors"
                  >
                    {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Modification...
                    </>
                  ) : (
                    <>
                      <FiKey className="w-4 h-4" />
                      Changer le mot de passe
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={togglePasswordForm}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
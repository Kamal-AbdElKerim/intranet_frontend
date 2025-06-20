import { Fragment } from 'react';
import Pageheader from '../../../components/common/pageheader/pageheader';
import { useAuth } from '../../../components/utile/AuthProvider';

const Profile = () => {
    const { user } = useAuth();
    console.log('Profile - Current user data:', user);

    // Custom CSS styles for avatar
    const avatarStyles = {
        avatar: {
            width: '128px',
            height: '128px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '48px',
            fontWeight: 'bold',
            boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
        }
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    };

    // Helper function to get initials
    const getInitials = (firstName, lastName) => {
        const first = firstName ? firstName.charAt(0).toUpperCase() : '';
        const last = lastName ? lastName.charAt(0).toUpperCase() : '';
        return first + last;
    };

    if (!user || !user.data) {
        return (
            <Fragment>
                <Pageheader currentpage="Profil" activepage="Pages" mainpage="Profil" />
                <div className="flex items-center justify-center min-h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600">Chargement du profil...</p>
                    </div>
                </div>
            </Fragment>
        );
    }

    const userData = user.data;

    return (
        <Fragment>
            <Pageheader currentpage="Profil" activepage="Pages" mainpage="Profil" />
            
            <div className="grid grid-cols-12 gap-6">
                {/* Profile Header Card */}
                <div className="xl:col-span-12 col-span-12">
                    <div className="box custom-box bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-lg">
                        <div className="box-body p-8">
                            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    <div style={avatarStyles.avatar}>
                                    {getInitials(userData.first_name, userData.last_name)}
                                    </div>
                                </div>
                                
                                {/* User Info */}
                                <div className="flex-1 text-center lg:text-left">
                                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                        {userData.first_name || '-'} {userData.last_name || '-'}
                                    </h1>
                                    <p className="text-xl text-gray-600 mb-3">{userData.job_title || '-'}</p>
                                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <i className="ri-mail-line text-lg"></i>
                                            <span>{userData.email || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <i className="ri-phone-line text-lg"></i>
                                            <span>{userData.phone || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <i className="ri-id-card-line text-lg"></i>
                                            <span>Matricule: {userData.matricule || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="flex-shrink-0">
                                    <span className={`inline-flex items-center px-4 py-2 badge !rounded-full bg-success/10 text-success`} >
                                        Actif
                                    </span>
                                        
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Personal Information */}
                <div className="xl:col-span-6 col-span-12">
                    <div className="box custom-box h-full">
                        <div className="box-header">
                            <div className="box-title flex items-center gap-2">
                                <i className="ri-user-line text-primary"></i>
                                Informations Personnelles
                            </div>
                        </div>
                        <div className="box-body">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-500 mb-1">Nom complet</label>
                                        <span className="text-gray-800 font-medium">{userData.first_name || '-'} {userData.last_name || '-'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-500 mb-1">Nom d'utilisateur</label>
                                        <span className="text-gray-800 font-medium">{userData.name || '-'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-500 mb-1">Email</label>
                                        <span className="text-gray-800 font-medium">{userData.email || '-'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-500 mb-1">Téléphone</label>
                                        <span className="text-gray-800 font-medium">{userData.phone || '-'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-500 mb-1">Matricule</label>
                                        <span className="text-gray-800 font-medium">{userData.matricule || '-'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-500 mb-1">Poste</label>
                                        <span className="text-gray-800 font-medium">{userData.job_title || '-'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-500 mb-1">Date de naissance</label>
                                        <span className="text-gray-800 font-medium">{userData.date_naissance ? formatDate(userData.date_naissance) : '-'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-500 mb-1">Type de contrat</label>
                                        <span className="text-gray-800 font-medium">{userData.type_Contrat ? userData.type_Contrat.trim() : '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Organization Information */}
                <div className="xl:col-span-6 col-span-12">
                    <div className="box custom-box h-full">
                        <div className="box-header">
                            <div className="box-title flex items-center gap-2">
                                <i className="ri-building-line text-primary"></i>
                                Informations Organisationnelles
                            </div>
                        </div>
                        <div className="box-body">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-500 mb-1">Entité</label>
                                        <span className="text-gray-800 font-medium">{userData.entity || '-'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-500 mb-1">Département</label>
                                        <span className="text-gray-800 font-medium">{userData.departement || '-'}</span>
                                    </div>
                                    {/* <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-500 mb-1">Projet</label>
                                        <span className="text-gray-800 font-medium">{userData.project?.name || '-'}</span>
                                    </div> */}
                                    {/* <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-500 mb-1">Description du projet</label>
                                        <span className="text-gray-800 font-medium">{userData.project?.description || '-'}</span>
                                    </div> */}
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-500 mb-1">Date d'embauche</label>
                                        <span className="text-gray-800 font-medium">{userData.date_embauche ? formatDate(userData.date_embauche) : '-'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-500 mb-1">Date de départ</label>
                                        <span className="text-gray-800 font-medium">{userData.DateDeDepart ? formatDate(userData.DateDeDepart) : '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Information
                <div className="xl:col-span-6 col-span-12">
                    <div className="box custom-box h-full">
                        <div className="box-header">
                            <div className="box-title flex items-center gap-2">
                                <i className="ri-settings-line text-primary"></i>
                                Informations du Compte
                            </div>
                        </div>
                        <div className="box-body">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-500 mb-1">ID Utilisateur</label>
                                        <span className="text-gray-800 font-medium">{userData.id}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-500 mb-1">Email vérifié</label>
                                        <span className={`font-medium ${userData.email_verified_at ? 'text-green-600' : 'text-red-600'}`}>
                                            {userData.email_verified_at ? 'Oui' : 'Non'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-500 mb-1">Date de création</label>
                                        <span className="text-gray-800 font-medium">{formatDate(userData.created_at)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-500 mb-1">Dernière mise à jour</label>
                                        <span className="text-gray-800 font-medium">{formatDate(userData.updated_at)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-500 mb-1">Solde</label>
                                        <span className="text-gray-800 font-medium">{userData.solde || 'Non spécifié'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-500 mb-1">Solde Traité</label>
                                        <span className="text-gray-800 font-medium">{userData.solde_Traité}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> */}

                {/* LDAP Information */}
                {userData.user_dn && (
                    <div className="xl:col-span-12 col-span-12">
                        <div className="box custom-box">
                            <div className="box-header">
                                <div className="box-title flex items-center gap-2">
                                    <i className="ri-database-line text-primary"></i>
                                    Informations LDAP
                                </div>
                            </div>
                            <div className="box-body">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="text-sm font-medium text-gray-500 mb-2 block">Distinguished Name (DN)</label>
                                    <code className="text-sm text-gray-700 bg-white p-3 rounded border block break-all">
                                        {userData.user_dn}
                                    </code>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Fragment>
    );
};

export default Profile;

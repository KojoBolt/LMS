import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../lib/firebaseConfig';
// import badgeImage from "../../assets/images/badge.png"; 

const Guides = () => {
    // --- State for data and filters ---
    const [allGuides, setAllGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('All categories');
    const [skillFilter, setSkillFilter] = useState('All skill levels');

    // --- Fetch guides from Firestore ---
    useEffect(() => {
        const fetchGuides = async () => {
            setLoading(true);
            try {
                // Query the 'courses' collection for documents where contentType is 'guide'
                const guidesQuery = query(collection(db, 'courses'), where("contentType", "==", "guide"));
                const querySnapshot = await getDocs(guidesQuery);
                const guidesData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAllGuides(guidesData);
            } catch (err) {
                console.error("Error fetching guides:", err);
                setError('Failed to fetch guides: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchGuides();
    }, []);

    // --- Memoized calculations for filters and filtered guides ---
    const categories = useMemo(() => {
        const allCategories = allGuides.flatMap(guide => guide.tags || []);
        return ['All categories', ...new Set(allCategories)];
    }, [allGuides]);

    const skillLevels = useMemo(() => {
        const allLevels = allGuides.map(guide => guide.courseLevel);
        return ['All skill levels', ...new Set(allLevels)];
    }, [allGuides]);

    const filteredGuides = useMemo(() => {
        return allGuides.filter(guide => {
            const categoryMatch = categoryFilter === 'All categories' || (guide.tags && guide.tags.includes(categoryFilter));
            const skillMatch = skillFilter === 'All skill levels' || guide.courseLevel === skillFilter;
            return categoryMatch && skillMatch;
        });
    }, [allGuides, categoryFilter, skillFilter]);

    const clearFilters = () => {
        setCategoryFilter('All categories');
        setSkillFilter('All skill levels');
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">
                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>;
    }

    if (error) {
        return <div className="p-8 ml-[300px] text-red-600">{error}</div>;
    }
    const getLevelColors = (level) => {
  switch (level) {
    case 'Beginner':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Intermediate':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Advanced':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'All Levels':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

    return (
        <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 bg-white lg:ml-[300px] mt-[60px] lg:mt-0 mb-[60px] lg:mb-0 overflow-auto overflow-x-hidden">
    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">Guides</h1>
    
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
        <div className="relative flex-1 sm:flex-none">
            <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full appearance-none bg-gray-100 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 pr-8 text-sm sm:text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
        
        <div className="relative flex-1 sm:flex-none">
            <select 
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="w-full appearance-none bg-gray-100 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 pr-8 text-sm sm:text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {skillLevels.map(level => <option key={level} value={level}>{level}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
        
        <button 
            onClick={clearFilters} 
            className="w-full sm:w-auto sm:ml-auto text-gray-600 hover:text-gray-800 bg-gray-100 px-3 sm:px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-300 text-sm sm:text-base"
        >
            Clear filters
        </button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        {filteredGuides.map((guide) => (
            <Link 
                to={`/student/guides/${guide.id}`} 
                key={guide.id} 
                className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
                <div className={`h-40 sm:h-44 md:h-48 relative p-3 sm:p-4 bg-gray-800`}>
                    <img 
                        src={guide.courseThumbnail || 'https://placehold.co/400x200/111827/FFFFFF?text=Guide'} 
                        alt={guide.courseTitle} 
                        className="w-full h-full object-cover opacity-50"
                    />
                    <button className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white/20 backdrop-blur-sm rounded-full p-1.5 sm:p-2 shadow-sm hover:shadow-md transition-shadow">
                        <Bookmark className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </button>
                    <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-white font-semibold text-xs sm:text-sm">A</span>
                    </div>
                </div>
                
                <div className="p-4 sm:p-5 md:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 leading-tight h-12 sm:h-14 overflow-hidden">
                        {guide.courseTitle}
                    </h3>
                    <div className="mb-3 sm:mb-4">
                        <span className={`inline-block text-xs font-medium px-2 py-1 rounded border ${getLevelColors(guide.courseLevel)}`}>
                            {guide.courseLevel}
                        </span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 h-8 sm:h-10 overflow-hidden">
                        {guide.tags && guide.tags.join(' | ')}
                    </div>
                </div>
            </Link>
        ))}
    </div>
</div>
    );
};

export default Guides;

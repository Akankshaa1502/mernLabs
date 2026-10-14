const CATEGORIES = ["Electronics", "Fashion", "Books", "Home"];

// Controlled inputs: the parent page owns the values and decides
// when to call the API.
function SearchBar({ search, category, sort, onSearchChange, onCategoryChange, onSortChange }) {
  return (
    <div className="search-bar">
      <input
        type="search"
        className="search-input"
        placeholder="Search products..."
        aria-label="Search products"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <select
        className="filter-select"
        aria-label="Filter by category"
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option value="">All Categories</option>
        {CATEGORIES.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      <select
        className="filter-select"
        aria-label="Sort products"
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value="">Newest first</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
}

export default SearchBar;

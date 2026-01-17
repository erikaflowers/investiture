/**
 * Database Service
 * Wrapper for database operations - provider-agnostic interface
 *
 * To swap providers (Supabase, Firebase, REST API, etc.),
 * update the internal implementation while keeping the interface stable.
 */

// In-memory store for demo purposes
// TODO: Replace with actual database connection
const store = new Map();

/**
 * Query records from a table
 * @param {string} table - Table name
 * @param {import('../types/interfaces.js').QueryFilters} [filters] - Query filters
 * @returns {Promise<import('../types/interfaces.js').QueryResult>}
 */
export async function query(table, filters = {}) {
  // TODO: Replace with actual database query
  // Example for Supabase:
  // let query = supabase.from(table).select('*');
  // if (filters.where) { ... }
  // const { data, error } = await query;

  console.log(`[Database] Query: ${table}`, filters);

  return new Promise((resolve) => {
    setTimeout(() => {
      const tableData = store.get(table) || [];
      let results = [...tableData];

      // Apply filters
      if (filters.where) {
        results = results.filter((row) => {
          return Object.entries(filters.where).every(([key, value]) => {
            return row[key] === value;
          });
        });
      }

      // Apply ordering
      if (filters.orderBy) {
        const { field, direction = 'asc' } = filters.orderBy;
        results.sort((a, b) => {
          const aVal = a[field];
          const bVal = b[field];
          const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return direction === 'asc' ? cmp : -cmp;
        });
      }

      // Apply limit
      if (filters.limit) {
        results = results.slice(0, filters.limit);
      }

      resolve({
        data: results,
        error: null,
        count: results.length,
      });
    }, 100);
  });
}

/**
 * Insert a new record
 * @param {string} table - Table name
 * @param {object} data - Data to insert
 * @returns {Promise<import('../types/interfaces.js').MutationResult>}
 */
export async function insert(table, data) {
  // TODO: Replace with actual database insert
  // Example for Supabase:
  // const { data: result, error } = await supabase.from(table).insert(data).select();

  console.log(`[Database] Insert: ${table}`, data);

  return new Promise((resolve) => {
    setTimeout(() => {
      const tableData = store.get(table) || [];
      const newRecord = {
        id: 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      tableData.push(newRecord);
      store.set(table, tableData);

      resolve({
        data: newRecord,
        error: null,
      });
    }, 100);
  });
}

/**
 * Update an existing record
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @param {object} data - Data to update
 * @returns {Promise<import('../types/interfaces.js').MutationResult>}
 */
export async function update(table, id, data) {
  // TODO: Replace with actual database update
  // Example for Supabase:
  // const { data: result, error } = await supabase.from(table).update(data).eq('id', id).select();

  console.log(`[Database] Update: ${table}/${id}`, data);

  return new Promise((resolve) => {
    setTimeout(() => {
      const tableData = store.get(table) || [];
      const index = tableData.findIndex((row) => row.id === id);

      if (index === -1) {
        resolve({
          data: null,
          error: { message: 'Record not found', code: 'NOT_FOUND' },
        });
        return;
      }

      const updatedRecord = {
        ...tableData[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };

      tableData[index] = updatedRecord;
      store.set(table, tableData);

      resolve({
        data: updatedRecord,
        error: null,
      });
    }, 100);
  });
}

/**
 * Delete a record
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @returns {Promise<import('../types/interfaces.js').MutationResult>}
 */
export async function remove(table, id) {
  // Note: Named 'remove' to avoid conflict with reserved word 'delete'
  // TODO: Replace with actual database delete
  // Example for Supabase:
  // const { error } = await supabase.from(table).delete().eq('id', id);

  console.log(`[Database] Delete: ${table}/${id}`);

  return new Promise((resolve) => {
    setTimeout(() => {
      const tableData = store.get(table) || [];
      const index = tableData.findIndex((row) => row.id === id);

      if (index === -1) {
        resolve({
          data: null,
          error: { message: 'Record not found', code: 'NOT_FOUND' },
        });
        return;
      }

      const deleted = tableData.splice(index, 1)[0];
      store.set(table, tableData);

      resolve({
        data: deleted,
        error: null,
      });
    }, 100);
  });
}

// Alias for backwards compatibility with spec
export { remove as delete };

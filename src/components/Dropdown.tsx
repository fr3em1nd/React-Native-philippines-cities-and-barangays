import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { DropdownProps, DropdownItem, DropdownStyles } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const defaultStyles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
    flex: 1,
  },
  chevron: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.7,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    flexGrow: 1,
  },
  listItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedItem: {
    backgroundColor: '#f0f8ff',
  },
  selectedItemText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export const Dropdown: React.FC<DropdownProps> = ({
  items,
  selectedValue,
  onValueChange,
  placeholder = 'Select an option',
  disabled = false,
  searchable = true,
  searchPlaceholder = 'Search...',
  modalTitle = 'Select Option',
  styles: customStyles = {},
  testID,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedItem = useMemo(() => {
    return items.find((item) => item.value === selectedValue);
  }, [items, selectedValue]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }
    const lowerQuery = searchQuery.toLowerCase();
    return items.filter((item) =>
      item.label.toLowerCase().includes(lowerQuery)
    );
  }, [items, searchQuery]);

  const handleOpen = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
      setSearchQuery('');
    }
  }, [disabled]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
  }, []);

  const handleSelect = useCallback(
    (item: DropdownItem) => {
      onValueChange(item.value, item);
      handleClose();
    },
    [onValueChange, handleClose]
  );

  const renderItem = useCallback(
    ({ item }: { item: DropdownItem }) => {
      const isSelected = item.value === selectedValue;
      return (
        <TouchableOpacity
          style={[
            defaultStyles.listItem,
            customStyles.listItem,
            isSelected && defaultStyles.selectedItem,
            isSelected && customStyles.selectedItem,
          ]}
          onPress={() => handleSelect(item)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              defaultStyles.listItemText,
              customStyles.listItemText,
              isSelected && defaultStyles.selectedItemText,
              isSelected && customStyles.selectedItemText,
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      );
    },
    [selectedValue, handleSelect, customStyles]
  );

  const renderEmpty = useCallback(() => {
    return (
      <View style={defaultStyles.emptyContainer}>
        <Text style={[defaultStyles.emptyText, customStyles.emptyText]}>
          No results found
        </Text>
      </View>
    );
  }, [customStyles]);

  const keyExtractor = useCallback((item: DropdownItem) => item.value, []);

  return (
    <View style={[defaultStyles.container, customStyles.container]} testID={testID}>
      <TouchableOpacity
        style={[
          defaultStyles.button,
          customStyles.button,
          disabled && defaultStyles.buttonDisabled,
        ]}
        onPress={handleOpen}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled}
        testID={testID ? `${testID}-button` : undefined}
      >
        {selectedItem ? (
          <Text
            style={[defaultStyles.buttonText, customStyles.buttonText]}
            numberOfLines={1}
          >
            {selectedItem.label}
          </Text>
        ) : (
          <Text
            style={[defaultStyles.placeholder, customStyles.placeholder]}
            numberOfLines={1}
          >
            {placeholder}
          </Text>
        )}
        <Text style={defaultStyles.chevron}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={defaultStyles.modalOverlay}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={handleClose}
          />
          <SafeAreaView
            style={[defaultStyles.modalContent, customStyles.modalContent]}
          >
            <View style={[defaultStyles.modalHeader, customStyles.modalHeader]}>
              <Text style={[defaultStyles.modalTitle, customStyles.modalTitle]}>
                {modalTitle}
              </Text>
              <TouchableOpacity
                style={[defaultStyles.closeButton, customStyles.closeButton]}
                onPress={handleClose}
              >
                <Text
                  style={[
                    defaultStyles.closeButtonText,
                    customStyles.closeButtonText,
                  ]}
                >
                  Done
                </Text>
              </TouchableOpacity>
            </View>

            {searchable && (
              <View style={defaultStyles.searchContainer}>
                <TextInput
                  style={[defaultStyles.searchInput, customStyles.searchInput]}
                  placeholder={searchPlaceholder}
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCorrect={false}
                  autoCapitalize="none"
                  testID={testID ? `${testID}-search` : undefined}
                />
              </View>
            )}

            <FlatList
              data={filteredItems}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              ListEmptyComponent={renderEmpty}
              contentContainerStyle={defaultStyles.listContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              testID={testID ? `${testID}-list` : undefined}
            />
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default Dropdown;

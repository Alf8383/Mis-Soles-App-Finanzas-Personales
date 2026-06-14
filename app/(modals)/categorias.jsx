import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "../../src/components/layout/Screen";
import { Card, ConfirmDialog, PrimaryButton, TextField } from "../../src/components/ui";
import { CATEGORY_ICON_OPTIONS, DEFAULT_CATEGORY_ICON, getCategoryIconName } from "../../src/lib/domain/category-icons";
import { CategoryKind } from "../../src/lib/domain/enums";
import { useAuthFlowStore, useCategoriesStore, useMovementsStore } from "../../src/stores";
import { useAppTheme } from "../../src/theme";

const CATEGORY_COLORS = ["#005440", "#855400", "#004B84", "#BA1A1A", "#0F6E56", "#EF9F27"];

export default function CategoriasModal() {
  const { colors, spacing, typography } = useAppTheme();
  const user = useAuthFlowStore((state) => state.user);
  const categories = useCategoriesStore((state) => state.categories);
  const error = useCategoriesStore((state) => state.error);
  const status = useCategoriesStore((state) => state.status);
  const loadCategories = useCategoriesStore((state) => state.loadCategories);
  const createCategory = useCategoriesStore((state) => state.createCategory);
  const updateCategory = useCategoriesStore((state) => state.updateCategory);
  const archiveCategory = useCategoriesStore((state) => state.archiveCategory);
  const loadMovements = useMovementsStore((state) => state.loadMovements);
  const [name, setName] = useState("");
  const [kind, setKind] = useState(CategoryKind.EXPENSE);
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [icon, setIcon] = useState(DEFAULT_CATEGORY_ICON);
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [formError, setFormError] = useState("");
  const isSaving = status === "saving";
  const editingCategory = categories.find((category) => category.id === editingCategoryId);
  const expenseCategories = useMemo(
    () => categories.filter((category) => category.kind === CategoryKind.EXPENSE),
    [categories],
  );
  const incomeCategories = useMemo(
    () => categories.filter((category) => category.kind === CategoryKind.INCOME),
    [categories],
  );

  useEffect(() => {
    if (user?.uid) {
      loadCategories(user.uid);
    }
  }, [loadCategories, user?.uid]);

  function resetForm() {
    setName("");
    setKind(CategoryKind.EXPENSE);
    setColor(CATEGORY_COLORS[0]);
    setIcon(DEFAULT_CATEGORY_ICON);
    setEditingCategoryId("");
    setFormError("");
  }

  function startEdit(category) {
    setEditingCategoryId(category.id);
    setName(category.name || "");
    setKind(category.kind || CategoryKind.EXPENSE);
    setColor(category.color || CATEGORY_COLORS[0]);
    setIcon(getCategoryIconName(category.icon));
  }

  async function handleSave() {
    setFormError("");

    if (!user?.uid) return;

    if (!name.trim()) {
      setFormError("Ingresa un nombre para la categoría.");
      return;
    }

    const values = { color, icon, kind, name };
    const result = editingCategory
      ? await updateCategory(user.uid, editingCategory.id, values)
      : await createCategory(user.uid, values);

    if (!result.error) {
      resetForm();
      await loadMovements(user.uid);
    }
  }

  async function handleArchive() {
    if (!user?.uid || !archiveTarget || archiveTarget.isDefault) return;

    const result = await archiveCategory(user.uid, archiveTarget.id);

    if (!result.error) {
      setArchiveTarget(null);
      if (editingCategoryId === archiveTarget.id) resetForm();
      await loadMovements(user.uid);
    }
  }

  return (
    <>
      <Screen scrollable bottomInset={32}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.sizes.xxl }]}>
              Categorías
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Personaliza tus etiquetas financieras
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar categorías"
            onPress={() => router.back()}
            style={[styles.closeButton, { backgroundColor: colors.surfaceContainerLow }]}
          >
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        {status === "loading" ? (
          <ActivityIndicator style={{ marginTop: spacing.lg }} color={colors.primary} />
        ) : null}
        {error || formError ? (
          <Text style={[styles.error, { color: colors.red, marginTop: spacing.md }]}>{formError || error}</Text>
        ) : null}

        <Card style={{ marginTop: spacing.lg }}>
          <View style={styles.formHeader}>
            <View style={[styles.previewIcon, { backgroundColor: color }]}>
              <Ionicons name={getCategoryIconName(icon)} size={24} color={colors.surface} />
            </View>
            <View style={styles.formHeaderCopy}>
              <Text style={[styles.formTitle, { color: colors.textPrimary }]}>
                {editingCategory ? "Editar categoría" : "Nueva categoría"}
              </Text>
              <Text style={[styles.formHint, { color: colors.textSecondary }]}>
                {name.trim() || "Elige nombre, tipo, color e icono"}
              </Text>
            </View>
          </View>
          <TextField label="Nombre" value={name} onChangeText={setName} placeholder="Ej. Mascotas" />
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Tipo</Text>
          <View style={[styles.segmentedControl, { backgroundColor: colors.surfaceContainerLow }]}>
            <TypeOption
              active={kind === CategoryKind.EXPENSE}
              color={colors.red}
              icon="arrow-down-circle-outline"
              label="Gasto"
              onPress={() => setKind(CategoryKind.EXPENSE)}
            />
            <TypeOption
              active={kind === CategoryKind.INCOME}
              color={colors.primary}
              icon="arrow-up-circle-outline"
              label="Ingreso"
              onPress={() => setKind(CategoryKind.INCOME)}
            />
          </View>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Color</Text>
          <View style={styles.paletteRow}>
            {CATEGORY_COLORS.map((option) => (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityLabel={`Usar color ${option}`}
                onPress={() => setColor(option)}
                style={[
                  styles.colorSwatch,
                  {
                    backgroundColor: option,
                    borderColor: color === option ? colors.textPrimary : colors.border,
                  },
                ]}
              >
                {color === option ? <Ionicons name="checkmark" size={16} color={colors.surface} /> : null}
              </Pressable>
            ))}
          </View>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Icono</Text>
          <View style={styles.iconGrid}>
            {CATEGORY_ICON_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityLabel={`Usar icono ${option.label}`}
                onPress={() => setIcon(option.value)}
                style={({ pressed }) => [
                  styles.iconChoice,
                  {
                    backgroundColor: getCategoryIconName(icon) === option.value ? colors.primarySoft : colors.surfaceContainerLow,
                    borderColor: getCategoryIconName(icon) === option.value ? colors.primary : colors.border,
                    opacity: pressed ? 0.84 : 1,
                  },
                ]}
              >
                <Ionicons
                  name={option.value}
                  size={20}
                  color={getCategoryIconName(icon) === option.value ? colors.primary : colors.textSecondary}
                />
              </Pressable>
            ))}
          </View>
          <PrimaryButton
            label={isSaving ? "Guardando..." : editingCategory ? "Guardar cambios" : "Crear categoría"}
            onPress={handleSave}
            disabled={isSaving}
            style={{ marginTop: spacing.md }}
          />
          {editingCategory ? (
            <PrimaryButton
              label="Cancelar edición"
              onPress={resetForm}
              style={{ marginTop: spacing.sm, backgroundColor: colors.gold }}
            />
          ) : null}
        </Card>

        <CategoryList
          categories={expenseCategories}
          colors={colors}
          onArchive={setArchiveTarget}
          onEdit={startEdit}
          spacing={spacing}
          title="Gastos"
        />
        <CategoryList
          categories={incomeCategories}
          colors={colors}
          onArchive={setArchiveTarget}
          onEdit={startEdit}
          spacing={spacing}
          title="Ingresos"
        />
      </Screen>
      <ConfirmDialog
        visible={Boolean(archiveTarget)}
        danger
        title="¿Archivar categoría?"
        message="No se eliminarán movimientos existentes. La categoría dejará de aparecer en nuevos formularios."
        confirmLabel="Archivar"
        cancelLabel="Volver"
        onCancel={() => setArchiveTarget(null)}
        onConfirm={handleArchive}
      />
    </>
  );
}

function CategoryList({ categories, colors, onArchive, onEdit, spacing, title }) {
  return (
    <Card style={{ marginTop: spacing.md }}>
      <View style={styles.listHeader}>
        <Text style={[styles.listTitle, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.listCount, { color: colors.textSecondary }]}>{categories.length}</Text>
      </View>
      {categories.length === 0 ? (
        <View style={[styles.emptyList, { backgroundColor: colors.surfaceContainerLow }]}>
          <Ionicons name="pricetag-outline" size={20} color={colors.textTertiary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aún no hay categorías aquí.</Text>
        </View>
      ) : null}
      {categories.map((category) => (
        <View key={category.id} style={[styles.categoryRow, { backgroundColor: colors.surfaceContainerLow }]}>
          <View style={[styles.categoryIcon, { backgroundColor: category.color || colors.primary }]}>
            <Ionicons name={getCategoryIconName(category.icon)} size={21} color={colors.surface} />
          </View>
          <View style={styles.categoryCopy}>
            <Text style={[styles.categoryName, { color: colors.textPrimary }]}>{category.name}</Text>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: category.isDefault ? colors.primarySoft : colors.goldSoft },
              ]}
            >
              <Text style={[styles.categoryMeta, { color: category.isDefault ? colors.primary : colors.gold }]}>
                {category.isDefault ? "Base" : "Personalizada"}
              </Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Editar ${category.name}`}
            onPress={() => onEdit(category)}
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="create-outline" size={19} color={colors.primary} />
          </Pressable>
          {!category.isDefault ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Archivar ${category.name}`}
              onPress={() => onArchive(category)}
              style={[styles.iconButton, { backgroundColor: colors.surface }]}
            >
              <Ionicons name="archive-outline" size={19} color={colors.red} />
            </Pressable>
          ) : null}
        </View>
      ))}
    </Card>
  );
}

function TypeOption({ active, color, icon, label, onPress }) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.typeOption,
        {
          backgroundColor: active ? colors.surface : "transparent",
          opacity: pressed ? 0.86 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={18} color={active ? color : colors.textSecondary} />
      <Text style={[styles.typeOptionText, { color: active ? colors.textPrimary : colors.textSecondary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  categoryBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryCopy: {
    flex: 1,
  },
  categoryIcon: {
    alignItems: "center",
    borderRadius: 16,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  categoryMeta: {
    fontSize: 11,
    fontWeight: "900",
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "900",
  },
  categoryRow: {
    alignItems: "center",
    borderRadius: 20,
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    padding: 12,
  },
  closeButton: {
    alignItems: "center",
    borderRadius: 21,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  colorSwatch: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 2,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  emptyList: {
    alignItems: "center",
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    padding: 14,
  },
  emptyText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
  },
  error: {
    fontWeight: "700",
  },
  formHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  formHeaderCopy: {
    flex: 1,
  },
  formHint: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 3,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: "900",
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconButton: {
    alignItems: "center",
    borderRadius: 14,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  iconChoice: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  listCount: {
    fontSize: 13,
    fontWeight: "900",
  },
  listHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  listTitle: {
    fontSize: 17,
    fontWeight: "900",
  },
  paletteRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  previewIcon: {
    alignItems: "center",
    borderRadius: 20,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "900",
    marginTop: 14,
    textTransform: "uppercase",
  },
  segmentedControl: {
    borderRadius: 18,
    flexDirection: "row",
    gap: 4,
    marginTop: 8,
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  title: {
    fontWeight: "900",
  },
  typeOption: {
    alignItems: "center",
    borderRadius: 15,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 44,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: "900",
  },
});

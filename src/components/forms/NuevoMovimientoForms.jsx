import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { getCategoryIconName } from "../../lib/domain/category-icons";
import {
  CurrencyCode,
  MovementType,
  ObligationType,
  ScheduledPaymentFrequency,
} from "../../lib/domain/enums";
import { useAppTheme } from "../../theme";
import { Chip, MoneyText, TextField } from "../ui";

export function DebtForm({
  amount,
  currency,
  debtDirection,
  description,
  dueDate,
  personName,
  setAmount,
  setCurrency,
  setDebtDirection,
  setDescription,
  setDueDate,
  setPersonName,
}) {
  const { colors, spacing } = useAppTheme();

  return (
    <>
      <TextField label="Persona" value={personName} onChangeText={setPersonName} placeholder="Ej. Ana, Carlos, mamá" />
      <TextField label="Monto" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" />
      <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: spacing.md }]}>Dirección</Text>
      <View style={styles.chipRow}>
        <Chip
          label="Yo debo"
          active={debtDirection === ObligationType.DEBT_I_OWE}
          onPress={() => setDebtDirection(ObligationType.DEBT_I_OWE)}
        />
        <Chip
          label="Me deben"
          active={debtDirection === ObligationType.DEBT_OWED_TO_ME}
          onPress={() => setDebtDirection(ObligationType.DEBT_OWED_TO_ME)}
        />
      </View>
      <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: spacing.md }]}>Moneda</Text>
      <View style={styles.chipRow}>
        <Chip label="PEN" active={currency === CurrencyCode.PEN} onPress={() => setCurrency(CurrencyCode.PEN)} />
        <Chip label="USD" active={currency === CurrencyCode.USD} onPress={() => setCurrency(CurrencyCode.USD)} />
      </View>
      <TextField label="Vence el (opcional)" value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" />
      <TextField label="Nota" value={description} onChangeText={setDescription} placeholder="Ej. Préstamo para emergencia" />
    </>
  );
}

export function FixedPaymentForm({
  accounts,
  amount,
  categories,
  categoryId,
  fixedName,
  frequency,
  nextDueDate,
  selectedAccountId,
  selectedCategory,
  selectedCurrency,
  setAccountId,
  setAmount,
  setCategoryId,
  setFixedName,
  setFrequency,
  setNextDueDate,
}) {
  const { colors, spacing } = useAppTheme();

  return (
    <>
      <View style={[styles.fixedIntro, { backgroundColor: colors.surfaceContainerLow }]}>
        <View style={[styles.fixedIntroIcon, { backgroundColor: colors.primary }]}>
          <Ionicons name="calendar-outline" size={22} color={colors.surface} />
        </View>
        <View style={styles.fixedIntroCopy}>
          <Text style={[styles.fixedIntroTitle, { color: colors.textPrimary }]}>Configura el pago</Text>
          <Text style={[styles.fixedIntroText, { color: colors.textSecondary }]}>
            Se creará como obligación recurrente. El saldo baja cuando lo marques como pagado.
          </Text>
        </View>
      </View>
      <TextField label="Nombre" value={fixedName} onChangeText={setFixedName} placeholder="Ej. Internet, alquiler, gimnasio" />
      <TextField label="Monto" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" />
      <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: spacing.md }]}>Cuenta</Text>
      <FixedAccountPicker accounts={accounts} selectedId={selectedAccountId} onSelect={setAccountId} />
      <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: spacing.md }]}>Categoría</Text>
      <FixedCategoryPicker categories={categories} selectedId={categoryId} onSelect={setCategoryId} />
      <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: spacing.md }]}>Frecuencia</Text>
      <View style={styles.frequencyGrid}>
        <FrequencyOption
          label="Mensual"
          description="Cada mes"
          icon="calendar-outline"
          active={frequency === ScheduledPaymentFrequency.MONTHLY}
          onPress={() => setFrequency(ScheduledPaymentFrequency.MONTHLY)}
        />
        <FrequencyOption
          label="Semanal"
          description="Cada semana"
          icon="repeat-outline"
          active={frequency === ScheduledPaymentFrequency.WEEKLY}
          onPress={() => setFrequency(ScheduledPaymentFrequency.WEEKLY)}
        />
      </View>
      <TextField label="Próximo vencimiento" value={nextDueDate} onChangeText={setNextDueDate} placeholder="YYYY-MM-DD" />
      <View style={styles.quickDateRow}>
        <QuickDateButton label="Hoy" onPress={() => setNextDueDate(getDateInputValue(0))} />
        <QuickDateButton label="7 días" onPress={() => setNextDueDate(getDateInputValue(7))} />
        <QuickDateButton label="30 días" onPress={() => setNextDueDate(getDateInputValue(30))} />
      </View>
      <FixedPaymentPreview
        amount={amount}
        category={selectedCategory}
        currency={selectedCurrency}
        frequency={frequency}
        name={fixedName}
        nextDueDate={nextDueDate}
      />
    </>
  );
}

export function MovementForm({
  accountId,
  accounts,
  amount,
  categoryId,
  categories,
  description,
  exchangeRate,
  fee,
  fromAccountId,
  movementType,
  requiresExchangeRate,
  setAccountId,
  setAmount,
  setCategoryId,
  setDescription,
  setExchangeRate,
  setFee,
  setFromAccountId,
  setToAccountId,
  toAccountId,
}) {
  const { colors, spacing } = useAppTheme();

  return (
    <>
      {/* Si te piden un campo nuevo de gasto/ingreso, agregalo como otro TextField en este bloque. */}
      <TextField label="Monto" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" />
      <TextField
        label="Descripción"
        value={description}
        onChangeText={setDescription}
        placeholder="Ej. Mercado, sueldo, transferencia"
      />

      {movementType === MovementType.TRANSFER ? (
        <>
          {/* Los campos de aqui solo aparecen cuando el movimiento es transferencia. */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: spacing.md }]}>Cuenta origen</Text>
          <AccountPicker accounts={accounts} selectedId={fromAccountId} onSelect={setFromAccountId} />
          <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: spacing.md }]}>Cuenta destino</Text>
          <AccountPicker accounts={accounts} selectedId={toAccountId} onSelect={setToAccountId} />
          {requiresExchangeRate ? (
            <TextField
              label="Tipo de cambio"
              value={exchangeRate}
              onChangeText={setExchangeRate}
              placeholder="Ej. 3.75"
              keyboardType="decimal-pad"
            />
          ) : null}
          <TextField label="Comisión opcional" value={fee} onChangeText={setFee} placeholder="0.00" keyboardType="decimal-pad" />
        </>
      ) : (
        <>
          {/* Estos campos aparecen para gasto e ingreso: cuenta y categoria. */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: spacing.md }]}>Cuenta</Text>
          <AccountPicker accounts={accounts} selectedId={accountId} onSelect={setAccountId} />
          <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: spacing.md }]}>Categoría</Text>
          <View style={styles.chipRow}>
            {categories.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                active={categoryId === category.id}
                onPress={() => setCategoryId(category.id)}
              />
            ))}
          </View>
        </>
      )}
    </>
  );
}

function AccountPicker({ accounts, selectedId, onSelect }) {
  return (
    <View style={styles.chipRow}>
      {accounts.map((account) => (
        <Chip
          key={account.id}
          label={`${account.name} · ${account.currency}`}
          active={selectedId === account.id}
          onPress={() => onSelect(account.id)}
        />
      ))}
    </View>
  );
}

function FixedAccountPicker({ accounts, selectedId, onSelect }) {
  const { colors } = useAppTheme();

  if (accounts.length === 0) {
    return (
      <View style={[styles.inlineEmpty, { backgroundColor: colors.surfaceContainerLow }]}>
        <Ionicons name="wallet-outline" size={18} color={colors.textTertiary} />
        <Text style={[styles.inlineEmptyText, { color: colors.textSecondary }]}>Crea una cuenta para asociar el pago.</Text>
      </View>
    );
  }

  return (
    <View style={styles.optionStack}>
      {accounts.map((account) => {
        const active = selectedId === account.id;

        return (
          <Pressable
            key={account.id}
            accessibilityRole="button"
            onPress={() => onSelect(account.id)}
            style={({ pressed }) => [
              styles.fixedOption,
              {
                backgroundColor: active ? colors.primarySoft : colors.surfaceContainerLow,
                borderColor: active ? colors.primary : colors.border,
                opacity: pressed ? 0.86 : 1,
              },
            ]}
          >
            <View style={[styles.fixedOptionIcon, { backgroundColor: active ? colors.primary : colors.surface }]}>
              <Ionicons name="wallet-outline" size={18} color={active ? colors.surface : colors.primary} />
            </View>
            <View style={styles.fixedOptionCopy}>
              <Text style={[styles.fixedOptionTitle, { color: colors.textPrimary }]}>{account.name}</Text>
              <Text style={[styles.fixedOptionMeta, { color: colors.textSecondary }]}>{account.currency}</Text>
            </View>
            {active ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function FixedCategoryPicker({ categories, selectedId, onSelect }) {
  const { colors } = useAppTheme();

  if (categories.length === 0) {
    return (
      <View style={[styles.inlineEmpty, { backgroundColor: colors.surfaceContainerLow }]}>
        <Ionicons name="pricetag-outline" size={18} color={colors.textTertiary} />
        <Text style={[styles.inlineEmptyText, { color: colors.textSecondary }]}>Crea una categoría de gasto primero.</Text>
      </View>
    );
  }

  return (
    <View style={styles.categoryGrid}>
      {categories.map((category) => {
        const active = selectedId === category.id;

        return (
          <Pressable
            key={category.id}
            accessibilityRole="button"
            onPress={() => onSelect(category.id)}
            style={({ pressed }) => [
              styles.categoryOption,
              {
                backgroundColor: active ? colors.primarySoft : colors.surfaceContainerLow,
                borderColor: active ? colors.primary : colors.border,
                opacity: pressed ? 0.86 : 1,
              },
            ]}
          >
            <View style={[styles.categoryOptionIcon, { backgroundColor: category.color || colors.primary }]}>
              <Ionicons name={getCategoryIconName(category.icon)} size={18} color={colors.surface} />
            </View>
            <Text numberOfLines={1} style={[styles.categoryOptionText, { color: colors.textPrimary }]}>
              {category.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function FrequencyOption({ active, description, icon, label, onPress }) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.frequencyOption,
        {
          backgroundColor: active ? colors.primary : colors.surfaceContainerLow,
          borderColor: active ? colors.primary : colors.border,
          opacity: pressed ? 0.86 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={18} color={active ? colors.surface : colors.primary} />
      <View style={styles.frequencyCopy}>
        <Text style={[styles.frequencyTitle, { color: active ? colors.surface : colors.textPrimary }]}>{label}</Text>
        <Text style={[styles.frequencyMeta, { color: active ? "rgba(255,255,255,0.72)" : colors.textSecondary }]}>
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

function QuickDateButton({ label, onPress }) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickDateButton,
        {
          backgroundColor: colors.surfaceContainerLow,
          borderColor: colors.border,
          opacity: pressed ? 0.86 : 1,
        },
      ]}
    >
      <Text style={[styles.quickDateText, { color: colors.primary }]}>{label}</Text>
    </Pressable>
  );
}

function FixedPaymentPreview({ amount, category, currency, frequency, name, nextDueDate }) {
  const { colors } = useAppTheme();
  const numericAmount = Number(amount);

  return (
    <View style={[styles.fixedPreview, { backgroundColor: colors.surfaceContainerLow }]}>
      <View style={styles.fixedPreviewHeader}>
        <Text style={[styles.fixedPreviewLabel, { color: colors.textSecondary }]}>Vista previa</Text>
        <Text style={[styles.fixedPreviewMeta, { color: colors.textSecondary }]}>{getFrequencyLabel(frequency)}</Text>
      </View>
      <View style={styles.fixedPreviewBody}>
        <View style={styles.fixedPreviewTitleRow}>
          <View style={[styles.fixedPreviewIcon, { backgroundColor: category?.color || colors.primary }]}>
            <Ionicons name={getCategoryIconName(category?.icon)} size={18} color={colors.surface} />
          </View>
          <View style={styles.fixedPreviewCopy}>
            <Text style={[styles.fixedPreviewName, { color: colors.textPrimary }]}>{name.trim() || "Nombre del pago"}</Text>
            <Text style={[styles.fixedPreviewDate, { color: colors.textSecondary }]}>{nextDueDate || "Sin fecha definida"}</Text>
          </View>
        </View>
        <MoneyText amount={numericAmount > 0 ? numericAmount : 0} currency={currency} tone="negative" />
      </View>
    </View>
  );
}

function getDateInputValue(daysFromToday) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
}

function getFrequencyLabel(frequency) {
  return frequency === ScheduledPaymentFrequency.WEEKLY ? "Semanal" : "Mensual";
}

const styles = StyleSheet.create({
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryOption: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexBasis: "47%",
    flexDirection: "row",
    gap: 10,
    minHeight: 54,
    padding: 10,
  },
  categoryOptionIcon: {
    alignItems: "center",
    borderRadius: 14,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  categoryOptionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "900",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  fixedIntro: {
    alignItems: "center",
    borderRadius: 20,
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
    padding: 14,
  },
  fixedIntroCopy: {
    flex: 1,
  },
  fixedIntroIcon: {
    alignItems: "center",
    borderRadius: 18,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  fixedIntroText: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 2,
  },
  fixedIntroTitle: {
    fontSize: 15,
    fontWeight: "900",
  },
  fixedOption: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 58,
    padding: 10,
  },
  fixedOptionCopy: {
    flex: 1,
  },
  fixedOptionIcon: {
    alignItems: "center",
    borderRadius: 15,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  fixedOptionMeta: {
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },
  fixedOptionTitle: {
    fontSize: 14,
    fontWeight: "900",
  },
  fixedPreview: {
    borderRadius: 20,
    marginTop: 16,
    padding: 14,
  },
  fixedPreviewBody: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginTop: 10,
  },
  fixedPreviewCopy: {
    flex: 1,
  },
  fixedPreviewDate: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  fixedPreviewHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  fixedPreviewIcon: {
    alignItems: "center",
    borderRadius: 14,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  fixedPreviewLabel: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  fixedPreviewMeta: {
    fontSize: 12,
    fontWeight: "900",
  },
  fixedPreviewName: {
    fontSize: 14,
    fontWeight: "900",
  },
  fixedPreviewTitleRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 10,
  },
  frequencyCopy: {
    flex: 1,
  },
  frequencyGrid: {
    flexDirection: "row",
    gap: 10,
  },
  frequencyMeta: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 1,
  },
  frequencyOption: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 58,
    padding: 10,
  },
  frequencyTitle: {
    fontSize: 13,
    fontWeight: "900",
  },
  inlineEmpty: {
    alignItems: "center",
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    padding: 12,
  },
  inlineEmptyText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
  },
  optionStack: {
    gap: 10,
  },
  quickDateButton: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 34,
    paddingHorizontal: 14,
  },
  quickDateRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  quickDateText: {
    fontSize: 12,
    fontWeight: "900",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
});
